import React, { useState } from 'react';
import { ResumeData, Experience, Education } from '@/src/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Trash2, Sparkles, Loader2, Lightbulb } from 'lucide-react';
import { optimizeBulletPoint, generateResumeSuggestions } from '@/src/services/gemini';
import { toast } from 'sonner';

interface ResumeBuilderProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export default function ResumeBuilder({ data, onChange }: ResumeBuilderProps) {
  const [optimizingId, setOptimizingId] = useState<string | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleGetSuggestions = async () => {
    setIsSuggesting(true);
    try {
      const res = await generateResumeSuggestions(data);
      setSuggestions(res);
      toast.success('AI suggestions generated!');
    } catch (error) {
      toast.error('Failed to get suggestions');
    } finally {
      setIsSuggesting(false);
    }
  };

  const updatePersonalInfo = (field: keyof ResumeData['personalInfo'], value: string) => {
    onChange({
      ...data,
      personalInfo: { ...data.personalInfo, [field]: value }
    });
  };

  const addExperience = () => {
    const newExp: Experience = {
      id: generateId(),
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      description: ['']
    };
    onChange({ ...data, experience: [...data.experience, newExp] });
  };

  const updateExperience = (id: string, field: keyof Experience, value: any) => {
    onChange({
      ...data,
      experience: data.experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp)
    });
  };

  const removeExperience = (id: string) => {
    onChange({ ...data, experience: data.experience.filter(exp => exp.id !== id) });
  };

  const addBulletPoint = (expId: string) => {
    onChange({
      ...data,
      experience: data.experience.map(exp => 
        exp.id === expId ? { ...exp, description: [...exp.description, ''] } : exp
      )
    });
  };

  const updateBulletPoint = (expId: string, index: number, value: string) => {
    onChange({
      ...data,
      experience: data.experience.map(exp => 
        exp.id === expId ? { 
          ...exp, 
          description: exp.description.map((bullet, i) => i === index ? value : bullet) 
        } : exp
      )
    });
  };

  const handleOptimizeBullet = async (expId: string, index: number, bullet: string, position: string) => {
    if (!bullet.trim()) return;
    const optId = `${expId}-${index}`;
    setOptimizingId(optId);
    try {
      const optimized = await optimizeBulletPoint(bullet, position || 'the role');
      updateBulletPoint(expId, index, optimized);
      toast.success('Bullet point optimized!');
    } catch (error) {
      toast.error('Failed to optimize bullet point');
    } finally {
      setOptimizingId(null);
    }
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: generateId(),
      school: '',
      degree: '',
      location: '',
      graduationDate: ''
    };
    onChange({ ...data, education: [...data.education, newEdu] });
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    onChange({
      ...data,
      education: data.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu)
    });
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Resume Details</h2>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 text-primary border-primary/20 hover:bg-primary/5"
          onClick={handleGetSuggestions}
          disabled={isSuggesting}
        >
          {isSuggesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lightbulb className="w-4 h-4" />}
          Get AI Suggestions
        </Button>
      </div>

      {suggestions.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> AI Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {suggestions.map((s, i) => (
                <li key={`suggestion-${i}`} className="text-sm text-slate-700 flex gap-2">
                  <span className="text-primary font-bold">•</span> {s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Personal Information</CardTitle>
          <CardDescription>How can recruiters reach you?</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <Input 
              placeholder="John Doe" 
              value={data.personalInfo.fullName} 
              onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input 
              type="email" 
              placeholder="john@example.com" 
              value={data.personalInfo.email} 
              onChange={(e) => updatePersonalInfo('email', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone</label>
            <Input 
              placeholder="+1 (555) 000-0000" 
              value={data.personalInfo.phone} 
              onChange={(e) => updatePersonalInfo('phone', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <Input 
              placeholder="New York, NY" 
              value={data.personalInfo.location} 
              onChange={(e) => updatePersonalInfo('location', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Work Experience</h2>
          <Button onClick={addExperience} variant="outline" size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> Add Experience
          </Button>
        </div>
        
        {data.experience.map((exp) => (
          <Card key={exp.id} className="relative group border-none shadow-sm bg-white/50 backdrop-blur-sm">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
              onClick={() => removeExperience(exp.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company</label>
                  <Input 
                    placeholder="Tech Corp" 
                    value={exp.company} 
                    onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Position</label>
                  <Input 
                    placeholder="Software Engineer" 
                    value={exp.position} 
                    onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <Input 
                    placeholder="Jan 2020" 
                    value={exp.startDate} 
                    onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Date</label>
                  <Input 
                    placeholder="Present" 
                    value={exp.endDate} 
                    onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-medium">Key Achievements</label>
                {exp.description.map((bullet, idx) => (
                  <div key={`bullet-${exp.id}-${idx}`} className="flex gap-2">
                    <div className="flex-1 relative">
                      <Textarea 
                        placeholder="Describe what you did..." 
                        value={bullet} 
                        onChange={(e) => updateBulletPoint(exp.id, idx, e.target.value)}
                        className="min-h-[80px] pr-10"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute bottom-2 right-2 h-8 w-8 text-primary hover:text-primary/80"
                        onClick={() => handleOptimizeBullet(exp.id, idx, bullet, exp.position)}
                        disabled={optimizingId === `${exp.id}-${idx}`}
                      >
                        {optimizingId === `${exp.id}-${idx}` ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="mt-2 text-muted-foreground"
                      onClick={() => {
                        const newBullets = exp.description.filter((_, i) => i !== idx);
                        updateExperience(exp.id, 'description', newBullets);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full border-dashed border-2 h-10 gap-2"
                  onClick={() => addBulletPoint(exp.id)}
                >
                  <Plus className="w-4 h-4" /> Add Bullet Point
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Education</h2>
          <Button onClick={addEducation} variant="outline" size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> Add Education
          </Button>
        </div>
        
        {data.education.map((edu) => (
          <Card key={edu.id} className="relative group border-none shadow-sm bg-white/50 backdrop-blur-sm">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
              onClick={() => onChange({ ...data, education: data.education.filter(e => e.id !== edu.id) })}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">School</label>
                <Input 
                  placeholder="University of Life" 
                  value={edu.school} 
                  onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Degree</label>
                <Input 
                  placeholder="B.S. Computer Science" 
                  value={edu.degree} 
                  onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input 
                  placeholder="Boston, MA" 
                  value={edu.location} 
                  onChange={(e) => updateEducation(edu.id, 'location', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Graduation Date</label>
                <Input 
                  placeholder="May 2019" 
                  value={edu.graduationDate} 
                  onChange={(e) => updateEducation(edu.id, 'graduationDate', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Skills</CardTitle>
          <CardDescription>Add your technical and soft skills</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, idx) => (
              <div key={`skill-${idx}`} className="flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium group">
                {skill}
                <button 
                  onClick={() => onChange({ ...data, skills: data.skills.filter((_, i) => i !== idx) })}
                  className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input 
              placeholder="Add a skill (e.g. React, Python, Leadership)" 
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = e.currentTarget.value.trim();
                  if (val && !data.skills.includes(val)) {
                    onChange({ ...data, skills: [...data.skills, val] });
                    e.currentTarget.value = '';
                  }
                }
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
