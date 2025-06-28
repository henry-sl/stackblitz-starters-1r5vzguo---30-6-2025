import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { 
  Building2, 
  Save, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  Users,
  Award,
  MapPin,
  Phone,
  Mail,
  FileText
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../hooks/useToast";
import { supabase } from "../../lib/supabaseClient";

export const CompanyProfile = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [profile, setProfile] = useState({
    basicInfo: {
      companyName: '',
      registrationNumber: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      establishedYear: ''
    },
    certifications: {
      cidbGrade: '',
      cidbExpiry: '',
      iso9001: false,
      iso14001: false,
      ohsas18001: false,
      contractorLicense: '',
      licenseExpiry: ''
    },
    experience: {
      yearsInOperation: '',
      totalProjects: '',
      totalValue: '',
      specialties: [],
      majorProjects: []
    },
    team: {
      totalEmployees: '',
      engineers: '',
      supervisors: '',
      technicians: '',
      laborers: '',
      keyPersonnel: []
    },
    preferences: {
      categories: [],
      locations: [],
      budgetRange: ''
    }
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load profile data when component mounts
  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      // Get the current session to get the access token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        addToast('Please log in to view your profile', 'error');
        return;
      }

      // Fetch profile data from API
      const response = await fetch('/api/company', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile data');
      }

      const profileData = await response.json();
      setProfile(profileData);
    } catch (error) {
      console.error('Error loading profile:', error);
      addToast('Failed to load profile data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Get the current session to get the access token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        addToast('Please log in to save your profile', 'error');
        return;
      }

      // Send profile data to API
      const response = await fetch('/api/company', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profile)
      });

      if (!response.ok) {
        throw new Error('Failed to save profile data');
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setIsEditing(false);
      addToast('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error saving profile:', error);
      addToast('Failed to save profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const getCompletionScore = () => {
    // Calculate profile completion based on filled fields
    let completed = 0;
    let total = 0;

    // Basic info (7 fields)
    Object.values(profile.basicInfo).forEach(value => {
      total++;
      if (value && value.trim()) completed++;
    });

    // Certifications (7 fields)
    total += 7;
    if (profile.certifications.cidbGrade) completed++;
    if (profile.certifications.cidbExpiry) completed++;
    if (profile.certifications.contractorLicense) completed++;
    if (profile.certifications.licenseExpiry) completed++;
    if (profile.certifications.iso9001) completed++;
    if (profile.certifications.iso14001) completed++;
    if (profile.certifications.ohsas18001) completed++;

    // Experience (4 main fields)
    total += 4;
    if (profile.experience.yearsInOperation) completed++;
    if (profile.experience.totalProjects) completed++;
    if (profile.experience.specialties.length > 0) completed++;
    if (profile.experience.majorProjects.length > 0) completed++;

    return Math.round((completed / total) * 100);
  };

  const completionScore = getCompletionScore();

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="skeleton h-8 w-1/3"></div>
          <div className="skeleton h-32 w-full"></div>
          <div className="skeleton h-96 w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Company Profile</h1>
            <p className="text-gray-600 mt-2">
              Complete your profile to get personalized AI assistance and improve your tender success rate
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Completion Score */}
        <Card className="mt-6 border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-700 font-bold">{completionScore}%</span>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">Profile Completion</h3>
                  <p className="text-sm text-blue-700">
                    {completionScore >= 80 ? "Excellent! Your profile is comprehensive." :
                     completionScore >= 60 ? "Good progress! Add more details to improve AI assistance." :
                     "Complete more sections to unlock better AI features."}
                  </p>
                </div>
              </div>
              <div className="w-24 h-2 bg-blue-200 rounded-full">
                <div 
                  className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${completionScore}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Tabs */}
      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        {/* Basic Information */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="w-5 h-5" />
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <Input
                    value={profile.basicInfo.companyName}
                    disabled={!isEditing}
                    onChange={(e) => setProfile({
                      ...profile,
                      basicInfo: { ...profile.basicInfo, companyName: e.target.value }
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Number *
                  </label>
                  <Input
                    value={profile.basicInfo.registrationNumber}
                    disabled={!isEditing}
                    onChange={(e) => setProfile({
                      ...profile,
                      basicInfo: { ...profile.basicInfo, registrationNumber: e.target.value }
                    })}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <Input
                    value={profile.basicInfo.address}
                    disabled={!isEditing}
                    onChange={(e) => setProfile({
                      ...profile,
                      basicInfo: { ...profile.basicInfo, address: e.target.value }
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <Input
                    value={profile.basicInfo.phone}
                    disabled={!isEditing}
                    onChange={(e) => setProfile({
                      ...profile,
                      basicInfo: { ...profile.basicInfo, phone: e.target.value }
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    value={profile.basicInfo.email}
                    disabled={!isEditing}
                    onChange={(e) => setProfile({
                      ...profile,
                      basicInfo: { ...profile.basicInfo, email: e.target.value }
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <Input
                    value={profile.basicInfo.website}
                    disabled={!isEditing}
                    onChange={(e) => setProfile({
                      ...profile,
                      basicInfo: { ...profile.basicInfo, website: e.target.value }
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Established Year *
                  </label>
                  <Input
                    value={profile.basicInfo.establishedYear}
                    disabled={!isEditing}
                    onChange={(e) => setProfile({
                      ...profile,
                      basicInfo: { ...profile.basicInfo, establishedYear: e.target.value }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certifications */}
        <TabsContent value="certifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>Certifications & Licenses</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CIDB Grade *
                  </label>
                  <select
                    value={profile.certifications.cidbGrade}
                    disabled={!isEditing}
                    onChange={(e) => setProfile({
                      ...profile,
                      certifications: { ...profile.certifications, cidbGrade: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">Select Grade</option>
                    <option value="G1">G1</option>
                    <option value="G2">G2</option>
                    <option value="G3">G3</option>
                    <option value="G4">G4</option>
                    <option value="G5">G5</option>
                    <option value="G6">G6</option>
                    <option value="G7">G7</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CIDB Expiry Date
                  </label>
                  <Input
                    type="date"
                    value={profile.certifications.cidbExpiry}
                    disabled={!isEditing}
                    onChange={(e) => setProfile({
                      ...profile,
                      certifications: { ...profile.certifications, cidbExpiry: e.target.value }
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contractor License Number
                  </label>
                  <Input
                    value={profile.certifications.contractorLicense}
                    disabled={!isEditing}
                    onChange={(e) => setProfile({
                      ...profile,
                      certifications: { ...profile.certifications, contractorLicense: e.target.value }
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    License Expiry Date
                  </label>
                  <Input
                    type="date"
                    value={profile.certifications.licenseExpiry}
                    disabled={!isEditing}
                    onChange={(e) => setProfile({
                      ...profile,
                      certifications: { ...profile.certifications, licenseExpiry: e.target.value }
                    })}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Quality & Safety Certifications
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={profile.certifications.iso9001}
                        disabled={!isEditing}
                        onChange={(e) => setProfile({
                          ...profile,
                          certifications: { ...profile.certifications, iso9001: e.target.checked }
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>ISO 9001:2015 (Quality Management)</span>
                      {profile.certifications.iso9001 && <CheckCircle className="w-4 h-4 text-green-500" />}
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={profile.certifications.iso14001}
                        disabled={!isEditing}
                        onChange={(e) => setProfile({
                          ...profile,
                          certifications: { ...profile.certifications, iso14001: e.target.checked }
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>ISO 14001 (Environmental Management)</span>
                      {profile.certifications.iso14001 && <CheckCircle className="w-4 h-4 text-green-500" />}
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={profile.certifications.ohsas18001}
                        disabled={!isEditing}
                        onChange={(e) => setProfile({
                          ...profile,
                          certifications: { ...profile.certifications, ohsas18001: e.target.checked }
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>OHSAS 18001 (Occupational Health & Safety)</span>
                      {profile.certifications.ohsas18001 && <CheckCircle className="w-4 h-4 text-green-500" />}
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Experience */}
        <TabsContent value="experience">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Company Experience</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years in Operation
                    </label>
                    <Input
                      value={profile.experience.yearsInOperation}
                      disabled={!isEditing}
                      onChange={(e) => setProfile({
                        ...profile,
                        experience: { ...profile.experience, yearsInOperation: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Projects Completed
                    </label>
                    <Input
                      value={profile.experience.totalProjects}
                      disabled={!isEditing}
                      onChange={(e) => setProfile({
                        ...profile,
                        experience: { ...profile.experience, totalProjects: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Project Value
                    </label>
                    <Input
                      value={profile.experience.totalValue}
                      disabled={!isEditing}
                      onChange={(e) => setProfile({
                        ...profile,
                        experience: { ...profile.experience, totalValue: e.target.value }
                      })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialties
                  </label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {profile.experience.specialties.map((specialty, index) => (
                      <Badge key={index} variant="secondary">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                  {isEditing && (
                    <Input placeholder="Add specialty (press Enter)" />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Major Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.experience.majorProjects.map((project, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Project Name
                          </label>
                          <Input
                            value={project.name || ''}
                            disabled={!isEditing}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Year
                          </label>
                          <Input
                            value={project.year || ''}
                            disabled={!isEditing}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Value
                          </label>
                          <Input
                            value={project.value || ''}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="md:col-span-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Client
                          </label>
                          <Input
                            value={project.client || ''}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {isEditing && (
                  <Button variant="outline" className="mt-4">
                    Add Project
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Team */}
        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Team & Capacity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{profile.team.totalEmployees}</div>
                  <div className="text-sm text-gray-600">Total Employees</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{profile.team.engineers}</div>
                  <div className="text-sm text-gray-600">Engineers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{profile.team.supervisors}</div>
                  <div className="text-sm text-gray-600">Supervisors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{profile.team.technicians}</div>
                  <div className="text-sm text-gray-600">Technicians</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{profile.team.laborers}</div>
                  <div className="text-sm text-gray-600">Laborers</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Key Personnel</h3>
                <div className="space-y-4">
                  {profile.team.keyPersonnel.map((person, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                          </label>
                          <Input
                            value={person.name || ''}
                            disabled={!isEditing}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Position
                          </label>
                          <Input
                            value={person.position || ''}
                            disabled={!isEditing}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Experience
                          </label>
                          <Input
                            value={person.experience || ''}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Certifications
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {(person.certifications || []).map((cert, certIndex) => (
                              <Badge key={certIndex} variant="outline">
                                {cert}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {isEditing && (
                  <Button variant="outline" className="mt-4">
                    Add Personnel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Tender Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Categories
                  </label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {profile.preferences.categories.map((category, index) => (
                      <Badge key={index} className="bg-blue-100 text-blue-800">
                        {category}
                      </Badge>
                    ))}
                  </div>
                  {isEditing && (
                    <Input placeholder="Add category" />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Locations
                  </label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {profile.preferences.locations.map((location, index) => (
                      <Badge key={index} className="bg-green-100 text-green-800">
                        {location}
                      </Badge>
                    ))}
                  </div>
                  {isEditing && (
                    <Input placeholder="Add location" />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Range
                  </label>
                  <Input
                    value={profile.preferences.budgetRange}
                    disabled={!isEditing}
                    onChange={(e) => setProfile({
                      ...profile,
                      preferences: { ...profile.preferences, budgetRange: e.target.value }
                    })}
                    placeholder="e.g., RM 500,000 - RM 5,000,000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};