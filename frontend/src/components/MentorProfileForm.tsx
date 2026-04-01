import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Upload, X, Plus, Clock, Globe, DollarSign, Award, Briefcase, User, Star } from 'lucide-react';
import { useToast } from './ui/use-toast';

// Form validation schema
const mentorProfileSchema = z.object({
  // Basic Information
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  profileImage: z.string().optional(),
  headline: z.string().min(10, 'Headline must be at least 10 characters'),
  bio: z.string().min(50, 'Bio must be at least 50 characters'),
  location: z.string().optional(),
  languages: z.array(z.string()).optional(),

  // Professional Information
  skills: z.record(z.enum(['beginner', 'intermediate', 'advanced', 'expert'])),
  experienceYears: z.number().min(0).max(50),
  currentCompany: z.string().optional(),
  currentRole: z.string().optional(),
  pastExperience: z.array(z.object({
    company: z.string(),
    role: z.string(),
    years: z.string(),
  })).optional(),
  education: z.array(z.object({
    degree: z.string(),
    institution: z.string(),
    year: z.number(),
  })).optional(),

  // Pricing & Packages
  hourlyRate: z.number().min(100).max(10000),
  currency: z.string().default('INR'),
  packageDeals: z.array(z.object({
    sessions: z.number(),
    price: z.number(),
    savings: z.number(),
  })).optional(),
  freeConsultation: z.boolean().default(false),

  // Availability
  weeklySchedule: z.record(z.array(z.string())),
  timeZone: z.string().default('Asia/Kolkata'),
  responseTime: z.string().optional(),
  timeOff: z.array(z.object({
    start: z.string(),
    end: z.string(),
    reason: z.string(),
  })).optional(),

  // Verification & Credentials
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string(),
    year: z.number(),
    fileUrl: z.string().optional(),
  })).optional(),
  idDocument: z.string().optional(),
  workVerification: z.string().optional(),
});

type MentorProfileFormData = z.infer<typeof mentorProfileSchema>;

interface MentorProfileFormProps {
  initialData?: Partial<MentorProfileFormData>;
  onSubmit: (data: MentorProfileFormData) => void;
  isLoading?: boolean;
}

const skillLevels = ['beginner', 'intermediate', 'advanced', 'expert'] as const;
const commonSkills = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C++',
  'AWS', 'Docker', 'Kubernetes', 'MongoDB', 'PostgreSQL', 'MySQL',
  'Machine Learning', 'Data Science', 'DevOps', 'Mobile Development',
  'UI/UX Design', 'Project Management', 'Agile', 'Scrum'
];

const timeZones = [
  'Asia/Kolkata (IST)', 'Asia/Dubai (GST)', 'Europe/London (GMT)', 'America/New_York (EST)',
  'America/Los_Angeles (PST)', 'Australia/Sydney (AEST)', 'Europe/Paris (CET)', 'Asia/Tokyo (JST)'
];

const MentorProfileForm: React.FC<MentorProfileFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false
}) => {
  const { toast } = useToast();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [newPastExperience, setNewPastExperience] = useState({ company: '', role: '', years: '' });
  const [newEducation, setNewEducation] = useState({ degree: '', institution: '', year: new Date().getFullYear() });
  const [newCertification, setNewCertification] = useState({ name: '', issuer: '', year: new Date().getFullYear() });
  const [newPackageDeal, setNewPackageDeal] = useState({ sessions: 0, price: 0, savings: 0 });
  const [newTimeOff, setNewTimeOff] = useState({ start: '', end: '', reason: '' });

  const form = useForm<MentorProfileFormData>({
    resolver: zodResolver(mentorProfileSchema),
    defaultValues: {
      fullName: '',
      headline: '',
      bio: '',
      location: '',
      languages: [],
      skills: {},
      experienceYears: 0,
      currentCompany: '',
      currentRole: '',
      pastExperience: [],
      education: [],
      hourlyRate: 1000,
      currency: 'INR',
      packageDeals: [],
      freeConsultation: false,
      weeklySchedule: {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
      },
      timeZone: 'Asia/Kolkata',
      responseTime: '',
      timeOff: [],
      certifications: [],
      idDocument: '',
      workVerification: '',
      ...initialData
    }
  });

  const watchedSkills = form.watch('skills');
  const watchedPastExperience = form.watch('pastExperience') || [];
  const watchedEducation = form.watch('education') || [];
  const watchedCertifications = form.watch('certifications') || [];
  const watchedPackageDeals = form.watch('packageDeals') || [];
  const watchedTimeOff = form.watch('timeOff') || [];

  const addSkill = () => {
    if (newSkill && !selectedSkills.includes(newSkill)) {
      setSelectedSkills([...selectedSkills, newSkill]);
      form.setValue('skills', {
        ...watchedSkills,
        [newSkill]: 'intermediate'
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    const newSkills = selectedSkills.filter(s => s !== skill);
    setSelectedSkills(newSkills);
    const newSkillsObj = { ...watchedSkills };
    delete newSkillsObj[skill];
    form.setValue('skills', newsSkillsObj);
  };

  const updateSkillLevel = (skill: string, level: string) => {
    form.setValue('skills', {
      ...watchedSkills,
      [skill]: level
    });
  };

  const addPastExperience = () => {
    if (newPastExperience.company && newPastExperience.role && newPastExperience.years) {
      form.setValue('pastExperience', [...watchedPastExperience, newPastExperience]);
      setNewPastExperience({ company: '', role: '', years: '' });
    }
  };

  const removePastExperience = (index: number) => {
    form.setValue('pastExperience', watchedPastExperience.filter((_, i) => i !== index));
  };

  const addEducation = () => {
    if (newEducation.degree && newEducation.institution) {
      form.setValue('education', [...watchedEducation, newEducation]);
      setNewEducation({ degree: '', institution: '', year: new Date().getFullYear() });
    }
  };

  const removeEducation = (index: number) => {
    form.setValue('education', watchedEducation.filter((_, i) => i !== index));
  };

  const addCertification = () => {
    if (newCertification.name && newCertification.issuer) {
      form.setValue('certifications', [...watchedCertifications, newCertification]);
      setNewCertification({ name: '', issuer: '', year: new Date().getFullYear() });
    }
  };

  const removeCertification = (index: number) => {
    form.setValue('certifications', watchedCertifications.filter((_, i) => i !== index));
  };

  const addPackageDeal = () => {
    if (newPackageDeal.sessions > 0 && newPackageDeal.price > 0) {
      form.setValue('packageDeals', [...watchedPackageDeals, newPackageDeal]);
      setNewPackageDeal({ sessions: 0, price: 0, savings: 0 });
    }
  };

  const removePackageDeal = (index: number) => {
    form.setValue('packageDeals', watchedPackageDeals.filter((_, i) => i !== index));
  };

  const addTimeOff = () => {
    if (newTimeOff.start && newTimeOff.end && newTimeOff.reason) {
      form.setValue('timeOff', [...watchedTimeOff, newTimeOff]);
      setNewTimeOff({ start: '', end: '', reason: '' });
    }
  };

  const removeTimeOff = (index: number) => {
    form.setValue('timeOff', watchedTimeOff.filter((_, i) => i !== index));
  };

  const handleSubmit = (data: MentorProfileFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="professional">Professional</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
            <TabsTrigger value="review">Preview</TabsTrigger>
          </TabsList>

          {/* Basic Information */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Your identity and background information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Dr. Sarah Chen" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="profileImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Image</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-4">
                          <Input placeholder="https://example.com/profile.jpg" {...field} />
                          <Button type="button" variant="outline" size="sm">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="headline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Headline *</FormLabel>
                      <FormControl>
                        <Input placeholder="Senior Web Developer at Google | 10+ Years Experience" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="I'm a passionate educator with 10+ years in web development..."
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Bangalore, India" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="languages"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Languages</FormLabel>
                      <FormControl>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select languages" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="english">English</SelectItem>
                            <SelectItem value="hindi">Hindi</SelectItem>
                            <SelectItem value="mandarin">Mandarin</SelectItem>
                            <SelectItem value="spanish">Spanish</SelectItem>
                            <SelectItem value="french">French</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Professional Information */}
          <TabsContent value="professional" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Professional Information
                </CardTitle>
                <CardDescription>
                  Your expertise and credentials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Skills Section */}
                <div>
                  <FormLabel className="text-base font-medium">Skills *</FormLabel>
                  <FormDescription className="mb-4">
                    Add your technical skills and proficiency level
                  </FormDescription>
                  
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a skill..."
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      />
                      <Button type="button" onClick={addSkill} disabled={!newSkill}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {commonSkills.map(skill => (
                        <Badge
                          key={skill}
                          variant={selectedSkills.includes(skill) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            if (selectedSkills.includes(skill)) {
                              removeSkill(skill);
                            } else {
                              setSelectedSkills([...selectedSkills, skill]);
                              form.setValue('skills', {
                                ...watchedSkills,
                                [skill]: 'intermediate'
                              });
                            }
                          }}
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    {selectedSkills.length > 0 && (
                      <div className="space-y-2">
                        <FormLabel className="text-sm">Skill Levels</FormLabel>
                        {selectedSkills.map(skill => (
                          <div key={skill} className="flex items-center gap-2">
                            <span className="text-sm font-medium min-w-[100px]">{skill}</span>
                            <Select
                              value={watchedSkills[skill] || 'intermediate'}
                              onValueChange={(value) => updateSkillLevel(skill, value)}
                            >
                              <SelectTrigger className="flex-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {skillLevels.map(level => (
                                  <SelectItem key={level} value={level}>
                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSkill(skill)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <FormField
                  control={form.control}
                  name="experienceYears"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years of Experience *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="10" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="currentCompany"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Company</FormLabel>
                        <FormControl>
                          <Input placeholder="Google" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currentRole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Role</FormLabel>
                        <FormControl>
                          <Input placeholder="Senior Software Engineer" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Past Experience */}
                <div>
                  <FormLabel className="text-base font-medium">Past Experience</FormLabel>
                  <FormDescription className="mb-4">
                    Add your previous work experience
                  </FormDescription>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="Company"
                        value={newPastExperience.company}
                        onChange={(e) => setNewPastExperience({...newPastExperience, company: e.target.value})}
                      />
                      <Input
                        placeholder="Role"
                        value={newPastExperience.role}
                        onChange={(e) => setNewPastExperience({...newPastExperience, role: e.target.value})}
                      />
                      <Input
                        placeholder="Years (e.g., 2019-2022)"
                        value={newPastExperience.years}
                        onChange={(e) => setNewPastExperience({...newPastExperience, years: e.target.value})}
                      />
                    </div>
                    <Button type="button" onClick={addPastExperience} disabled={!newPastExperience.company || !newPastExperience.role}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Experience
                    </Button>

                    {watchedPastExperience.length > 0 && (
                      <div className="space-y-2">
                        {watchedPastExperience.map((exp, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{exp.role} at {exp.company}</p>
                              <p className="text-sm text-gray-600">{exp.years}</p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removePastExperience(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Education */}
                <div>
                  <FormLabel className="text-base font-medium">Education</FormLabel>
                  <FormDescription className="mb-4">
                    Add your educational background
                  </FormDescription>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="Degree"
                        value={newEducation.degree}
                        onChange={(e) => setNewEducation({...newEducation, degree: e.target.value})}
                      />
                      <Input
                        placeholder="Institution"
                        value={newEducation.institution}
                        onChange={(e) => setNewEducation({...newEducation, institution: e.target.value})}
                      />
                      <Input
                        type="number"
                        placeholder="Year"
                        value={newEducation.year}
                        onChange={(e) => setNewEducation({...newEducation, year: parseInt(e.target.value) || new Date().getFullYear()})}
                      />
                    </div>
                    <Button type="button" onClick={addEducation} disabled={!newEducation.degree || !newEducation.institution}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Education
                    </Button>

                    {watchedEducation.length > 0 && (
                      <div className="space-y-2">
                        {watchedEducation.map((edu, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{edu.degree}</p>
                              <p className="text-sm text-gray-600">{edu.institution} • {edu.year}</p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeEducation(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing & Packages */}
          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Pricing & Packages
                </CardTitle>
                <CardDescription>
                  Set your rates and create package deals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="hourlyRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hourly Rate (₹) *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="1500" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="INR">INR (₹)</SelectItem>
                              <SelectItem value="USD">USD ($)</SelectItem>
                              <SelectItem value="EUR">EUR (€)</SelectItem>
                              <SelectItem value="GBP">GBP (£)</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="freeConsultation"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Free Consultation</FormLabel>
                        <FormDescription>
                          Offer a free initial consultation session
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {/* Package Deals */}
                <div>
                  <FormLabel className="text-base font-medium">Package Deals</FormLabel>
                  <FormDescription className="mb-4">
                    Create discounted packages for multiple sessions
                  </FormDescription>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        type="number"
                        placeholder="Sessions"
                        value={newPackageDeal.sessions || ''}
                        onChange={(e) => setNewPackageDeal({...newPackageDeal, sessions: parseInt(e.target.value) || 0})}
                      />
                      <Input
                        type="number"
                        placeholder="Total Price"
                        value={newPackageDeal.price || ''}
                        onChange={(e) => setNewPackageDeal({...newPackageDeal, price: parseInt(e.target.value) || 0})}
                      />
                      <Input
                        type="number"
                        placeholder="Savings"
                        value={newPackageDeal.savings || ''}
                        onChange={(e) => setNewPackageDeal({...newPackageDeal, savings: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <Button type="button" onClick={addPackageDeal} disabled={newPackageDeal.sessions <= 0 || newPackageDeal.price <= 0}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Package Deal
                    </Button>

                    {watchedPackageDeals.length > 0 && (
                      <div className="space-y-2">
                        {watchedPackageDeals.map((pkg, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{pkg.sessions} Sessions - ₹{pkg.price}</p>
                              <p className="text-sm text-green-600">Save ₹{pkg.savings}</p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removePackageDeal(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Availability */}
          <TabsContent value="availability" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Availability
                </CardTitle>
                <CardDescription>
                  Set your working schedule and time preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="timeZone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time Zone *</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {timeZones.map(tz => (
                              <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="responseTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Average Response Time</FormLabel>
                      <FormControl>
                        <Input placeholder="Within 2 hours" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Weekly Schedule */}
                <div>
                  <FormLabel className="text-base font-medium">Weekly Schedule *</FormLabel>
                  <FormDescription className="mb-4">
                    Set your available time slots for each day
                  </FormDescription>
                  
                  <div className="space-y-4">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                      <div key={day} className="flex items-center gap-4">
                        <FormLabel className="min-w-[80px] capitalize">{day}</FormLabel>
                        <div className="flex-1">
                          <Input
                            placeholder="e.g., 9:00-12:00, 14:00-18:00"
                            value={(form.getValues(`weeklySchedule.${day}`) || []).join(', ')}
                            onChange={(e) => {
                              const times = e.target.value.split(',').map(t => t.trim()).filter(t => t);
                              form.setValue(`weeklySchedule.${day}` as any, times);
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Time Off */}
                <div>
                  <FormLabel className="text-base font-medium">Time Off</FormLabel>
                  <FormDescription className="mb-4">
                    Add dates when you'll be unavailable
                  </FormDescription>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        type="date"
                        placeholder="Start Date"
                        value={newTimeOff.start}
                        onChange={(e) => setNewTimeOff({...newTimeOff, start: e.target.value})}
                      />
                      <Input
                        type="date"
                        placeholder="End Date"
                        value={newTimeOff.end}
                        onChange={(e) => setNewTimeOff({...newTimeOff, end: e.target.value})}
                      />
                      <Input
                        placeholder="Reason"
                        value={newTimeOff.reason}
                        onChange={(e) => setNewTimeOff({...newTimeOff, reason: e.target.value})}
                      />
                    </div>
                    <Button type="button" onClick={addTimeOff} disabled={!newTimeOff.start || !newTimeOff.end || !newTimeOff.reason}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Time Off
                    </Button>

                    {watchedTimeOff.length > 0 && (
                      <div className="space-y-2">
                        {watchedTimeOff.map((timeOff, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{timeOff.reason}</p>
                              <p className="text-sm text-gray-600">{timeOff.start} to {timeOff.end}</p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTimeOff(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Verification & Credentials */}
          <TabsContent value="verification" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Verification & Credentials
                </CardTitle>
                <CardDescription>
                  Add your certifications and verification documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Certifications */}
                <div>
                  <FormLabel className="text-base font-medium">Certifications</FormLabel>
                  <FormDescription className="mb-4">
                    Add your professional certifications
                  </FormDescription>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="Certification Name"
                        value={newCertification.name}
                        onChange={(e) => setNewCertification({...newCertification, name: e.target.value})}
                      />
                      <Input
                        placeholder="Issuing Organization"
                        value={newCertification.issuer}
                        onChange={(e) => setNewCertification({...newCertification, issuer: e.target.value})}
                      />
                      <Input
                        type="number"
                        placeholder="Year"
                        value={newCertification.year}
                        onChange={(e) => setNewCertification({...newCertification, year: parseInt(e.target.value) || new Date().getFullYear()})}
                      />
                    </div>
                    <Button type="button" onClick={addCertification} disabled={!newCertification.name || !newCertification.issuer}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Certification
                    </Button>

                    {watchedCertifications.length > 0 && (
                      <div className="space-y-2">
                        {watchedCertifications.map((cert, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{cert.name}</p>
                              <p className="text-sm text-gray-600">{cert.issuer} • {cert.year}</p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCertification(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <FormField
                  control={form.control}
                  name="idDocument"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID Document</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-4">
                          <Input placeholder="Upload URL for government ID" {...field} />
                          <Button type="button" variant="outline" size="sm">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="workVerification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Verification</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-4">
                          <Input placeholder="Upload URL for employment proof" {...field} />
                          <Button type="button" variant="outline" size="sm">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics */}
          <TabsContent value="statistics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Statistics (Auto-calculated)
                </CardTitle>
                <CardDescription>
                  Your performance metrics will appear here as you complete sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Sessions</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Average Rating</p>
                    <p className="text-2xl font-bold">-</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Reviews</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Response Rate</p>
                    <p className="text-2xl font-bold">0%</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Completion Rate</p>
                    <p className="text-2xl font-bold">0%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preview */}
          <TabsContent value="review" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Preview</CardTitle>
                <CardDescription>
                  Review your profile before submitting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-xl font-bold">{form.getValues('fullName') || 'Your Name'}</h3>
                    <p className="text-gray-600">{form.getValues('headline') || 'Your headline'}</p>
                    <p className="text-sm text-gray-500">{form.getValues('location') || 'Location'}</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-2">Bio</h4>
                    <p className="text-sm text-gray-600">{form.getValues('bio') || 'Your bio will appear here...'}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedSkills.length > 0 ? (
                        selectedSkills.map(skill => (
                          <Badge key={skill} variant="secondary">
                            {skill} ({watchedSkills[skill]})
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No skills added yet</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Pricing</h4>
                    <p className="text-sm text-gray-600">
                      ₹{form.getValues('hourlyRate')}/hour
                      {form.getValues('freeConsultation') && ' • Free consultation available'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline">
            Save as Draft
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Complete Profile'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default MentorProfileForm;
