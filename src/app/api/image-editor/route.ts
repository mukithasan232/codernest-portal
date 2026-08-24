import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import os from 'os';
import fs from 'fs/promises';

const execFileAsync = promisify(execFile);
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

export async function POST(req: NextRequest) {
  let inputPath  = '';
  let outputPath = '';

  try {
    const formData = await req.formData();

    const file    = formData.get('file')    as File   | null;
    const actionsRaw = formData.get('actions') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 15MB limit' }, { status: 400 });
    }

    // Parse action pipeline
    let actions: string[] = [];
    try {
      actions = actionsRaw ? JSON.parse(actionsRaw) : [];
    } catch {
      return NextResponse.json({ error: 'Invalid actions payload' }, { status: 400 });
    }

    // Fallback: legacy single-action mode
    if (actions.length === 0) {
      const singleAction = formData.get('action') as string;
      if (singleAction) actions = [singleAction];
    }

    if (actions.length === 0) {
      return NextResponse.json({ error: 'No actions specified' }, { status: 400 });
    }

    // ── Write input to tmp ─────────────────────────────────────────────────
    const ts  = Date.now();
    const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
    inputPath = path.join(os.tmpdir(), `input_${ts}.${ext}`);
    await fs.writeFile(inputPath, Buffer.from(await file.arrayBuffer()));

    // ── Determine final output extension ──────────────────────────────────
    let outputExt = ext;
    let outputContentType = file.type;

    // If converting, use target format
    if (actions.includes('convert')) {
      const fmt = (formData.get('format') as string) || 'png';
      outputExt = fmt === 'jpeg' ? 'jpg' : fmt;
      outputContentType = `image/${fmt}`;
    }
    // If bg removal with transparent output, force PNG
    if (actions.includes('remove_bg')) {
      const bgMode = (formData.get('bg_mode') as string) || 'transparent';
      if (bgMode === 'transparent' && !actions.includes('convert')) {
        outputExt = 'png';
        outputContentType = 'image/png';
      }
    }

    outputPath = path.join(os.tmpdir(), `output_${ts}.${outputExt}`);

    // ── Build Python args ──────────────────────────────────────────────────
    const pythonScript = path.join(process.cwd(), 'scripts', 'image_processor.py');
    const args: string[] = [pythonScript, inputPath, outputPath];

    // Encode pipeline as JSON arg so Python can decode it
    const pipeline: Record<string, string> = {
      actions: JSON.stringify(actions),
    };

    if (actions.includes('remove_bg')) {
      pipeline.bg_mode  = (formData.get('bg_mode')  as string) || 'transparent';
      pipeline.bg_color = (formData.get('bg_color') as string) || '#ffffff';
      pipeline.defringe = (formData.get('defringe') as string) || '2';
    }
    if (actions.includes('resize')) {
      pipeline.width  = (formData.get('width')  as string) || '';
      pipeline.height = (formData.get('height') as string) || '';
    }
    if (actions.includes('convert')) {
      pipeline.format = (formData.get('format') as string) || 'png';
    }

    args.push(JSON.stringify(pipeline));

    // ── Execute Python Script ──────────────────────────────────────────────
    try {
      const { stdout, stderr } = await execFileAsync('python3', args, {
        timeout: 180_000,
        env: {
          ...process.env,
          // Force single-threaded onnxruntime to prevent recursive_mutex crash on macOS
          OMP_NUM_THREADS: '1',
          ONNXRUNTIME_NUM_THREADS: '1',
          ORT_DISABLE_ALL_TELEMETRY: '1',
        },
      });

      let result: { success: boolean; error?: string };
      try {
        result = JSON.parse(stdout);
      } catch {
        throw new Error(`Python output parse error: ${stdout} | stderr: ${stderr}`);
      }

      if (!result.success) {
        throw new Error(result.error || stderr || 'Unknown Python error');
      }
    } catch (execError: any) {
      console.error('Python Execution Error:', execError);
      return NextResponse.json(
        { error: `Processing error: ${execError.stderr || execError.message}` },
        { status: 500 }
      );
    }

    // ── Read & return processed file ───────────────────────────────────────
    const processedBuffer = await fs.readFile(outputPath);

    return new NextResponse(processedBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': outputContentType,
        'Content-Disposition': `attachment; filename="processed.${outputExt}"`,
      },
    });

  } catch (error: any) {
    console.error('Image Editor API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  } finally {
    if (inputPath)  await fs.unlink(inputPath).catch(() => {});
    if (outputPath) await fs.unlink(outputPath).catch(() => {});
  }
}
