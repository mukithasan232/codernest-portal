import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { FolderKanban, ArrowRight, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default async function ClientProjectsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/login');
  }

  const projects = await prisma.project.findMany({
    where: { clientId: session.user.id },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Your Projects</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Track the progress of your active development projects.</p>
      </div>

      {projects.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-white/10 bg-white/50 dark:bg-white/[0.02]">
          <FolderKanban className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No projects yet</h3>
          <p className="text-slate-500 mb-6">You don't have any active web development projects.</p>
          <Link href="/contact" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl inline-flex items-center gap-2 transition-all">
            Start a Project <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map(project => (
            <div key={project.id} className="p-6 rounded-2xl bg-white border border-slate-200 dark:bg-[#0f172a] dark:border-white/10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{project.title}</h3>
                  <p className="text-sm text-slate-500 capitalize">{project.type}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  project.status === 'completed' 
                    ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' 
                    : project.status === 'in-progress'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                    : 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300'
                }`}>
                  {project.status}
                </span>
              </div>
              
              <div className="mt-auto pt-6 flex items-center justify-between text-sm text-slate-500">
                <span className="flex items-center gap-2">
                  {project.status === 'completed' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Clock className="w-4 h-4" />}
                  {project.status === 'completed' ? 'Completed' : 'Active'}
                </span>
                <Link href={`/dashboard/projects/${project.id}`} className="text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1">
                  View Details <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
