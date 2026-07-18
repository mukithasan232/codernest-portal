import React from 'react';
import Image from 'next/image';
import { Linkedin, Twitter } from 'lucide-react';

interface SocialLinks {
  linkedin?: string;
  twitter?: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  socials: SocialLinks;
}

const teamMembers: TeamMember[] = [
  {
    id: 'member-1',
    name: 'Tushar Hasan',
    role: 'Founder & CEO',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    socials: {
      linkedin: 'https://linkedin.com',
      twitter: 'https://twitter.com',
    },
  },
  {
    id: 'member-2',
    name: 'Sarah Jenkins',
    role: 'Co-Founder & COO',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    socials: {
      linkedin: 'https://linkedin.com',
    },
  },
  {
    id: 'member-3',
    name: 'David Chen',
    role: 'Lead Developer',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    socials: {
      linkedin: 'https://linkedin.com',
      twitter: 'https://twitter.com',
    },
  },
  {
    id: 'member-4',
    name: 'Elena Rodriguez',
    role: 'UI/UX Designer',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    socials: {
      twitter: 'https://twitter.com',
    },
  },
  {
    id: 'member-5',
    name: 'Michael Scott',
    role: 'HR Manager',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    socials: {
      linkedin: 'https://linkedin.com',
    },
  },
  {
    id: 'member-6',
    name: 'Aisha Patel',
    role: 'Product Manager',
    image: 'https://images.unsplash.com/photo-1598550874175-4d0ef436c909?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    socials: {
      linkedin: 'https://linkedin.com',
      twitter: 'https://twitter.com',
    },
  },
  {
    id: 'member-7',
    name: 'James Wilson',
    role: 'Marketing Director',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    socials: {
      linkedin: 'https://linkedin.com',
    },
  },
  {
    id: 'member-8',
    name: 'Chloe Kim',
    role: 'Frontend Engineer',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    socials: {
      linkedin: 'https://linkedin.com',
      twitter: 'https://twitter.com',
    },
  },
];

export default function TeamSection() {
  return (
    <section className="py-24 bg-white dark:bg-slate-950">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Meet the Team
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            We are a passionate collective of designers, engineers, and strategists committed to building exceptional digital experiences.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 lg:gap-12 max-w-7xl mx-auto">
          {teamMembers.map((member) => (
            <div key={member.id} className="group flex flex-col items-center text-center">
              
              {/* Image Container */}
              <div className="relative w-full aspect-[3/4] mb-6 rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-900 shadow-sm">
                <Image
                  src={member.image}
                  alt={`Profile picture of ${member.name}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-out group-hover:scale-105"
                />
              </div>

              {/* Text & Socials */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {member.name}
                  </h3>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                    {member.role}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-4">
                  {member.socials.linkedin && (
                    <a 
                      href={member.socials.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      aria-label={`${member.name}'s LinkedIn`}
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {member.socials.twitter && (
                    <a 
                      href={member.socials.twitter} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors"
                      aria-label={`${member.name}'s Twitter`}
                    >
                      <Twitter className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
