import React from 'react';
import { ResumeData } from '@/src/types';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';

interface ResumePreviewProps {
  data: ResumeData;
}

export default function ResumePreview({ data }: ResumePreviewProps) {
  const { personalInfo, experience, education, skills } = data;

  return (
    <Card id="resume-preview" className="border-none shadow-xl bg-white min-h-[1056px] w-full max-w-[816px] mx-auto p-12 text-slate-800 font-sans">
      <CardContent className="p-0 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 uppercase">
            {personalInfo.fullName || 'Your Name'}
          </h1>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-600">
            {personalInfo.email && (
              <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4" />
                {personalInfo.email}
              </div>
            )}
            {personalInfo.phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="w-4 h-4" />
                {personalInfo.phone}
              </div>
            )}
            {personalInfo.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {personalInfo.location}
              </div>
            )}
            {personalInfo.website && (
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4" />
                {personalInfo.website}
              </div>
            )}
          </div>
        </div>

        {/* Experience */}
        {experience.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold border-b-2 border-slate-900 pb-1 uppercase tracking-wider">
              Experience
            </h2>
            <div className="space-y-6">
              {experience.map((exp) => (
                <div key={exp.id} className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-slate-900">{exp.position}</h3>
                    <span className="text-sm font-medium text-slate-600">
                      {exp.startDate} — {exp.endDate}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline italic text-slate-700">
                    <span>{exp.company}</span>
                    <span className="text-sm">{exp.location}</span>
                  </div>
                  <ul className="list-disc list-outside ml-4 space-y-1 text-sm leading-relaxed text-slate-700">
                    {exp.description.map((bullet, idx) => (
                      bullet && <li key={`preview-bullet-${exp.id}-${idx}`}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold border-b-2 border-slate-900 pb-1 uppercase tracking-wider">
              Education
            </h2>
            <div className="space-y-4">
              {education.map((edu) => (
                <div key={edu.id} className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-slate-900">{edu.school}</h3>
                    <span className="text-sm font-medium text-slate-600">{edu.graduationDate}</span>
                  </div>
                  <div className="flex justify-between items-baseline text-sm text-slate-700">
                    <span>{edu.degree}</span>
                    <span className="italic">{edu.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold border-b-2 border-slate-900 pb-1 uppercase tracking-wider">
              Skills
            </h2>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-700">
              {skills.map((skill, idx) => (
                <span key={`preview-skill-${idx}`} className="flex items-center gap-2">
                  {idx > 0 && <span className="text-slate-300">•</span>}
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
