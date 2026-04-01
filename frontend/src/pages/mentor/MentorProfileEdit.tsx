import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Plus, X, Save, User, Briefcase, GraduationCap, Globe, Clock, DollarSign, Award, MapPin, Languages, Calendar, Star, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import MentorLayout from '@/components/MentorLayout';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

interface Education {
  degree: string;
  institution: string;
  year: number;
}

interface PastExperience {
  company: string;
  role: string;
  years: string;
}

interface Certification {
  name: string;
  issuer: string;
  year: number;
  fileUrl?: string;
}

interface PackageDeal {
  sessions: number;
  price: number;
  savings: number;
}

interface TimeOff {
  start: string;
  end: string;
  reason: string;
}

const MentorProfileEdit = () => {
  const navigate = useNavigate();
  const { user, setUser, updateUser } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Basic Information (6 fields)
  const [fullName, setFullName] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);

  // Professional Information (7 fields)
  const [skillsData, setSkillsData] = useState<Record<string, string>>({});
  const [experienceYears, setExperienceYears] = useState(0);
  const [currentCompany, setCurrentCompany] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const [pastExperience, setPastExperience] = useState<PastExperience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);

  // Pricing & Packages (4 fields)
  const [hourlyRate, setHourlyRate] = useState(0);
  const [currency, setCurrency] = useState('INR');
  const [packageDeals, setPackageDeals] = useState<PackageDeal[]>([]);
  const [freeConsultation, setFreeConsultation] = useState(false);

  // Availability (4 fields)
  const [weeklySchedule, setWeeklySchedule] = useState<Record<string, string[]>>({
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: []
  });
  const [timeZone, setTimeZone] = useState('Asia/Kolkata');
  const [responseTime, setResponseTime] = useState('');
  const [timeOff, setTimeOff] = useState<TimeOff[]>([]);

  // Verification (4 fields)
  const [idDocument, setIdDocument] = useState('');
  const [workVerification, setWorkVerification] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Temporary form states
  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newPastExperience, setNewPastExperience] = useState({ company: '', role: '', years: '' });
  const [newEducation, setNewEducation] = useState({ degree: '', institution: '', year: new Date().getFullYear() });
  const [newCertification, setNewCertification] = useState({ name: '', issuer: '', year: new Date().getFullYear() });
  const [newPackageDeal, setNewPackageDeal] = useState({ sessions: 0, price: 0, savings: 0 });
  const [newTimeOff, setNewTimeOff] = useState({ start: '', end: '', reason: '' });

  const commonSkills = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C++',
    'AWS', 'Docker', 'Kubernetes', 'MongoDB', 'PostgreSQL', 'MySQL',
    'Machine Learning', 'Data Science', 'DevOps', 'Mobile Development',
    'UI/UX Design', 'Project Management', 'Agile', 'Scrum'
  ];

  const skillLevels = ['beginner', 'intermediate', 'advanced', 'expert'] as const;
  const timeZones = [
    'Asia/Kolkata', 'Asia/Dubai', 'Europe/London', 'America/New_York',
    'America/Los_Angeles', 'Australia/Sydney', 'Europe/Paris', 'Asia/Tokyo'
  ];

  useEffect(() => {
    const loadProfileData = async () => {
      if (user) {
        try {
          // Fetch the actual mentor profile from API
          const profileResponse = await api.get('/mentor-profiles/my/profile');
          const profile = profileResponse.data;
          
          setFullName(user.name || '');
          setProfileImage(user.profilePicture || '');
          setHeadline(profile.title || profile.headline || '');
          setBio(profile.bio || '');
          setLocation(profile.location || '');
          setLanguages(profile.languages ? (Array.isArray(profile.languages) ? profile.languages : [profile.languages]) : []);
          setSkillsData(profile.skillsData || {});
          setExperienceYears(profile.experience || profile.experienceYears || 0);
          setCurrentCompany(profile.company || profile.currentCompany || '');
          setCurrentRole(profile.currentRole || '');
          setPastExperience(profile.pastExperience || []);
          setEducation(profile.education || []);
          setCertifications(profile.certifications || []);
          setHourlyRate(profile.hourlyRate || 0);
          setCurrency(profile.currency || 'INR');
          setPackageDeals(profile.packageDeals || []);
          setFreeConsultation(profile.freeConsultation || false);
          setWeeklySchedule(profile.weeklySchedule || {
            monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: []
          });
          setTimeZone(profile.timeZone || 'Asia/Kolkata');
          setResponseTime(profile.responseTime || '');
          setTimeOff(profile.timeOff || []);
          setIdDocument(profile.idDocument || '');
          setWorkVerification(profile.workVerification || '');
        } catch (error: any) {
          console.error('Error loading profile data:', error);
          
          // If profile doesn't exist, create a basic one
          if (error.response?.status === 404) {
            try {
              const createResponse = await api.post('/mentor-profiles', {
                headline: '',
                bio: '',
                hourlyRate: 0,
                experienceYears: 0
              });
              const profile = createResponse.data.profile;
              
              setFullName(user.name || '');
              setProfileImage(user.profilePicture || '');
              setHeadline(profile.headline || '');
              setBio(profile.bio || '');
              setLocation(profile.location || '');
              setLanguages([]);
              setSkillsData({});
              setExperienceYears(0);
              setCurrentCompany('');
              setCurrentRole('');
              setPastExperience([]);
              setEducation([]);
              setCertifications([]);
              setHourlyRate(0);
              setCurrency('INR');
              setPackageDeals([]);
              setFreeConsultation(false);
              setWeeklySchedule({
                monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: []
              });
              setTimeZone('Asia/Kolkata');
              setResponseTime('');
              setTimeOff([]);
              setIdDocument('');
              setWorkVerification('');
            } catch (createError) {
              console.error('Error creating profile:', createError);
            }
          }
        }
      }
    };

    loadProfileData();
  }, [user]);

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      let profileId;
      
      try {
        // First get the current mentor profile to get the ID
        const profileResponse = await api.get('/mentor-profiles/my/profile');
        profileId = profileResponse.data.id;
      } catch (error: any) {
        // If profile doesn't exist, create it first
        if (error.response?.status === 404) {
          const createResponse = await api.post('/mentor-profiles', {
            headline: headline,
            bio: bio,
            hourlyRate: parseFloat(hourlyRate.toString()) || 0,
            experienceYears: parseInt(experienceYears.toString()) || 0
          });
          profileId = createResponse.data.profile.id;
        } else {
          throw error;
        }
      }

      const profileData = {
        fullName,
        profileImage,
        headline,
        bio,
        location,
        languages: Array.isArray(languages) ? languages : [languages],
        skillsData,
        experienceYears: parseInt(experienceYears.toString()) || 0,
        currentCompany,
        currentRole,
        pastExperience,
        education,
        hourlyRate: parseFloat(hourlyRate.toString()) || 0,
        currency,
        packageDeals,
        freeConsultation,
        weeklySchedule,
        timeZone,
        responseTime,
        timeOff,
        certifications,
        idDocument,
        workVerification,
        // Legacy fields for backward compatibility
        title: headline,
        company: currentCompany,
        experience: parseInt(experienceYears.toString()) || 0
      };

      const response = await api.put(`/mentor-profiles/${profileId}`, profileData);
      
      if (response.data.user) {
        updateUser(response.data.user);
      }
      
      toast({
        title: 'Profile Updated',
        description: 'Your mentor profile has been successfully updated.',
      });
      navigate('/mentor/dashboard');
    } catch (error: any) {
      console.error('Profile save error:', error);
      toast({
        title: 'Update Failed',
        description: error.response?.data?.error || error.message || 'There was an error updating your profile.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await api.post('/mentor-profiles/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setProfileImage(response.data.fileUrl);
        toast({
          title: 'Success',
          description: 'Profile picture uploaded successfully.',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to upload profile picture.',
          variant: 'destructive',
        });
      }
    }
  };

  // Helper functions
  const addSkill = () => {
    if (newSkill && !skillsData[newSkill]) {
      setSkillsData({ ...skillsData, [newSkill]: 'intermediate' });
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    const newSkills = { ...skillsData };
    delete newSkills[skill];
    setSkillsData(newSkills);
  };

  const updateSkillLevel = (skill: string, level: string) => {
    setSkillsData({ ...skillsData, [skill]: level });
  };

  const addLanguage = () => {
    if (newLanguage && !languages.includes(newLanguage)) {
      setLanguages([...languages, newLanguage]);
      setNewLanguage('');
    }
  };

  const removeLanguage = (lang: string) => {
    setLanguages(languages.filter(l => l !== lang));
  };

  const addPastExperience = () => {
    if (newPastExperience.company && newPastExperience.role && newPastExperience.years) {
      setPastExperience([...pastExperience, newPastExperience]);
      setNewPastExperience({ company: '', role: '', years: '' });
    }
  };

  const removePastExperience = (index: number) => {
    setPastExperience(pastExperience.filter((_, i) => i !== index));
  };

  const addEducation = () => {
    if (newEducation.degree && newEducation.institution) {
      setEducation([...education, newEducation]);
      setNewEducation({ degree: '', institution: '', year: new Date().getFullYear() });
    }
  };

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const addCertification = () => {
    if (newCertification.name && newCertification.issuer) {
      setCertifications([...certifications, newCertification]);
      setNewCertification({ name: '', issuer: '', year: new Date().getFullYear() });
    }
  };

  const removeCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const addPackageDeal = () => {
    if (newPackageDeal.sessions > 0 && newPackageDeal.price > 0) {
      setPackageDeals([...packageDeals, newPackageDeal]);
      setNewPackageDeal({ sessions: 0, price: 0, savings: 0 });
    }
  };

  const removePackageDeal = (index: number) => {
    setPackageDeals(packageDeals.filter((_, i) => i !== index));
  };

  const addTimeOff = () => {
    if (newTimeOff.start && newTimeOff.end && newTimeOff.reason) {
      setTimeOff([...timeOff, newTimeOff]);
      setNewTimeOff({ start: '', end: '', reason: '' });
    }
  };

  const removeTimeOff = (index: number) => {
    setTimeOff(timeOff.filter((_, i) => i !== index));
  };

  const initials = fullName?.split(' ').map(n => n[0]).join('') || 'M';

  return (
    <MentorLayout>
      <div className="p-6 md:p-8 max-w-5xl">
        <h1 className="text-2xl font-bold mb-1">Edit Profile</h1>
        <p className="text-muted-foreground mb-6">Update your comprehensive mentor profile</p>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="professional">Professional</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
          </TabsList>

          {/* Basic Information (6 fields) */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Profile Picture */}
                <div className="flex items-center gap-4">
                  {profileImage ? (
                    <img 
                      src={profileImage} 
                      alt={fullName} 
                      className="w-20 h-20 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary border">
                      {initials}
                    </div>
                  )}
                  <div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-3 w-3" /> Upload Photo
                    </Button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handlePictureUpload}
                    />
                    <p className="text-xs text-muted-foreground mt-1">JPG or PNG, max 2MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name *</label>
                    <Input value={fullName} onChange={e => setFullName(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Location</label>
                    <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Bangalore, India" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Professional Headline *</label>
                  <Input value={headline} placeholder="e.g., Senior Full-Stack Developer at Google" onChange={e => setHeadline(e.target.value)} />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Bio *</label>
                  <Textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} placeholder="Tell learners about your expertise and teaching style..." />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Languages</label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Add a language..." 
                        value={newLanguage}
                        onChange={(e) => setNewLanguage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                      />
                      <Button type="button" onClick={addLanguage} disabled={!newLanguage}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {languages.map(lang => (
                        <Badge key={lang} variant="secondary" className="cursor-pointer" onClick={() => removeLanguage(lang)}>
                          <Languages className="h-3 w-3 mr-1" />
                          {lang}
                          <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Professional Information (7 fields) */}
          <TabsContent value="professional" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium mb-2">Skills & Expertise *</label>
                  <div className="space-y-3">
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
                          variant={skillsData[skill] ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            if (skillsData[skill]) {
                              removeSkill(skill);
                            } else {
                              setSkillsData({ ...skillsData, [skill]: 'intermediate' });
                            }
                          }}
                        >
                          {skillsData[skill] && <CheckCircle className="h-3 w-3 mr-1" />}
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    {Object.keys(skillsData).length > 0 && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Skill Levels</label>
                        {Object.entries(skillsData).map(([skill, level]) => (
                          <div key={skill} className="flex items-center gap-2">
                            <span className="text-sm font-medium min-w-[120px]">{skill}</span>
                            <Select value={level} onValueChange={(value) => updateSkillLevel(skill, value)}>
                              <SelectTrigger className="flex-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {skillLevels.map(lvl => (
                                  <SelectItem key={lvl} value={lvl}>
                                    {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeSkill(skill)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Experience Years *</label>
                    <Input type="number" value={experienceYears} onChange={e => setExperienceYears(Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Current Role</label>
                    <Input value={currentRole} onChange={e => setCurrentRole(e.target.value)} placeholder="Senior Software Engineer" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Current Company</label>
                  <Input value={currentCompany} onChange={e => setCurrentCompany(e.target.value)} placeholder="Google" />
                </div>

                {/* Past Experience */}
                <div>
                  <label className="block text-sm font-medium mb-2">Past Experience</label>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <Input placeholder="Company" value={newPastExperience.company} onChange={(e) => setNewPastExperience({...newPastExperience, company: e.target.value})} />
                      <Input placeholder="Role" value={newPastExperience.role} onChange={(e) => setNewPastExperience({...newPastExperience, role: e.target.value})} />
                      <Input placeholder="Years" value={newPastExperience.years} onChange={(e) => setNewPastExperience({...newPastExperience, years: e.target.value})} />
                    </div>
                    <Button type="button" onClick={addPastExperience} disabled={!newPastExperience.company || !newPastExperience.role}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Experience
                    </Button>
                    {pastExperience.length > 0 && (
                      <div className="space-y-2">
                        {pastExperience.map((exp, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{exp.role} at {exp.company}</p>
                              <p className="text-sm text-gray-600">{exp.years}</p>
                            </div>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removePastExperience(index)}>
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
                  <label className="block text-sm font-medium mb-2">Education</label>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <Input placeholder="Degree" value={newEducation.degree} onChange={(e) => setNewEducation({...newEducation, degree: e.target.value})} />
                      <Input placeholder="Institution" value={newEducation.institution} onChange={(e) => setNewEducation({...newEducation, institution: e.target.value})} />
                      <Input type="number" placeholder="Year" value={newEducation.year} onChange={(e) => setNewEducation({...newEducation, year: parseInt(e.target.value) || new Date().getFullYear()})} />
                    </div>
                    <Button type="button" onClick={addEducation} disabled={!newEducation.degree || !newEducation.institution}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Education
                    </Button>
                    {education.length > 0 && (
                      <div className="space-y-2">
                        {education.map((edu, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{edu.degree}</p>
                              <p className="text-sm text-gray-600">{edu.institution} • {edu.year}</p>
                            </div>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeEducation(index)}>
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

          {/* Pricing & Packages (4 fields) */}
          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Pricing & Packages
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Hourly Rate (₹) *</label>
                    <Input type="number" value={hourlyRate} onChange={e => setHourlyRate(Number(e.target.value))} placeholder="1500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Currency</label>
                    <Select value={currency} onValueChange={setCurrency}>
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
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="freeConsultation" checked={freeConsultation} onCheckedChange={(checked) => setFreeConsultation(checked as boolean)} />
                  <label htmlFor="freeConsultation" className="text-sm font-medium">
                    Offer free consultation
                  </label>
                </div>

                {/* Package Deals */}
                <div>
                  <label className="block text-sm font-medium mb-2">Package Deals</label>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <Input type="number" placeholder="Sessions" value={newPackageDeal.sessions || ''} onChange={(e) => setNewPackageDeal({...newPackageDeal, sessions: parseInt(e.target.value) || 0})} />
                      <Input type="number" placeholder="Total Price" value={newPackageDeal.price || ''} onChange={(e) => setNewPackageDeal({...newPackageDeal, price: parseInt(e.target.value) || 0})} />
                      <Input type="number" placeholder="Savings" value={newPackageDeal.savings || ''} onChange={(e) => setNewPackageDeal({...newPackageDeal, savings: parseInt(e.target.value) || 0})} />
                    </div>
                    <Button type="button" onClick={addPackageDeal} disabled={newPackageDeal.sessions <= 0 || newPackageDeal.price <= 0}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Package Deal
                    </Button>
                    {packageDeals.length > 0 && (
                      <div className="space-y-2">
                        {packageDeals.map((pkg, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{pkg.sessions} Sessions - ₹{pkg.price}</p>
                              <p className="text-sm text-green-600">Save ₹{pkg.savings}</p>
                            </div>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removePackageDeal(index)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">You receive 80% after platform fee</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Availability (4 fields) */}
          <TabsContent value="availability" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Availability
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Time Zone</label>
                    <Select value={timeZone} onValueChange={setTimeZone}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeZones.map(tz => (
                          <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Response Time</label>
                    <Input value={responseTime} onChange={e => setResponseTime(e.target.value)} placeholder="Within 2 hours" />
                  </div>
                </div>

                {/* Weekly Schedule */}
                <div>
                  <label className="block text-sm font-medium mb-2">Weekly Schedule</label>
                  <div className="space-y-2">
                    {Object.keys(weeklySchedule).map(day => (
                      <div key={day} className="flex items-center gap-2">
                        <span className="text-sm font-medium capitalize w-20">{day}:</span>
                        <Input
                          placeholder="e.g., 9:00-12:00, 14:00-18:00"
                          value={weeklySchedule[day].join(', ')}
                          onChange={(e) => {
                            const times = e.target.value.split(',').map(t => t.trim()).filter(t => t);
                            setWeeklySchedule({...weeklySchedule, [day]: times});
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Time Off */}
                <div>
                  <label className="block text-sm font-medium mb-2">Time Off</label>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <Input type="date" placeholder="Start Date" value={newTimeOff.start} onChange={(e) => setNewTimeOff({...newTimeOff, start: e.target.value})} />
                      <Input type="date" placeholder="End Date" value={newTimeOff.end} onChange={(e) => setNewTimeOff({...newTimeOff, end: e.target.value})} />
                      <Input placeholder="Reason" value={newTimeOff.reason} onChange={(e) => setNewTimeOff({...newTimeOff, reason: e.target.value})} />
                    </div>
                    <Button type="button" onClick={addTimeOff} disabled={!newTimeOff.start || !newTimeOff.end || !newTimeOff.reason}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Time Off
                    </Button>
                    {timeOff.length > 0 && (
                      <div className="space-y-2">
                        {timeOff.map((timeOff, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{timeOff.reason}</p>
                              <p className="text-sm text-gray-600">{timeOff.start} to {timeOff.end}</p>
                            </div>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeTimeOff(index)}>
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

          {/* Verification (4 fields) */}
          <TabsContent value="verification" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Verification & Credentials
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Certifications */}
                <div>
                  <label className="block text-sm font-medium mb-2">Certifications</label>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <Input placeholder="Certification Name" value={newCertification.name} onChange={(e) => setNewCertification({...newCertification, name: e.target.value})} />
                      <Input placeholder="Issuing Organization" value={newCertification.issuer} onChange={(e) => setNewCertification({...newCertification, issuer: e.target.value})} />
                      <Input type="number" placeholder="Year" value={newCertification.year} onChange={(e) => setNewCertification({...newCertification, year: parseInt(e.target.value) || new Date().getFullYear()})} />
                    </div>
                    <Button type="button" onClick={addCertification} disabled={!newCertification.name || !newCertification.issuer}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Certification
                    </Button>
                    {certifications.length > 0 && (
                      <div className="space-y-2">
                        {certifications.map((cert, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{cert.name}</p>
                              <p className="text-sm text-gray-600">{cert.issuer} • {cert.year}</p>
                            </div>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeCertification(index)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">ID Document</label>
                    <Input value={idDocument} onChange={e => setIdDocument(e.target.value)} placeholder="Upload URL for government ID" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Work Verification</label>
                    <Input value={workVerification} onChange={e => setWorkVerification(e.target.value)} placeholder="Upload URL for employment proof" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews & Feedback (6 fields) - Display Only */}
          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Reviews & Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Review Management</h3>
                  <p className="text-gray-600">
                    Reviews and feedback are automatically collected from your sessions. 
                    You can respond to reviews and track your ratings through the mentor dashboard.
                  </p>
                  <Button className="mt-4" onClick={() => navigate('/mentor/dashboard')}>
                    View Reviews
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics (6 fields) - Display Only */}
          <TabsContent value="statistics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Statistics (Auto-calculated)
                </CardTitle>
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
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Statistics are automatically updated as you complete sessions and receive reviews.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 mt-8">
          <Button className="gap-1" onClick={handleSaveChanges} disabled={isLoading}>
            <Save className="h-4 w-4" /> {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button variant="outline" onClick={() => navigate('/mentor/dashboard')} disabled={isLoading}>Cancel</Button>
        </div>
      </div>
    </MentorLayout>
  );
};

export default MentorProfileEdit;
