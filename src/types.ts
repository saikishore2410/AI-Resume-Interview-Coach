export interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    website: string;
  };
  experience: Experience[];
  education: Education[];
  skills: string[];
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string[];
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  location: string;
  graduationDate: string;
}

export interface InterviewQuestion {
  id: string;
  question: string;
}

export interface InterviewFeedback {
  score: number;
  strengths: string[];
  improvements: string[];
  suggestedAnswer: string;
}
