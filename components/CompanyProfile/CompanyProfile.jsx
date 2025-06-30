import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../hooks/useToast";
import { api } from "../../lib/api";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import CertificationsList from "./CertificationsList";
import MajorProjectsList from "./MajorProjectsList";
import KeyPersonnelList from "./KeyPersonnelList";
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
  FileText,
  Shield,
  Clock,
  Star
} from "lucide-react";

export const CompanyProfile = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  // State for profile data - enhanced with verification status and new fields
  const [profile, setProfile] = useState({
    basicInfo: {
      companyName: "",
      registrationNumber: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      establishedYear: ""
    },
    certifications: {
      cidbGrade: "",
      cidbExpiry: "",
      iso9001: false,
      iso14001: false,
      ohsas18001: false,
      contractorLicense: "",
      licenseExpiry: "",
      customCertifications: []
    },
    experience: {
      yearsInOperation: "",
      totalProjects: "",
      totalValue: "",
      specialties: [],
      majorProjects: []
    },
    team: {
      totalEmployees: "",
      engineers: "",
      supervisors: "",
      technicians: "",
      laborers: "",
      keyPersonnel: []
    },
    preferences: {
      categories: [],
      locations: [],
      budgetRange: ""
    },
    verificationStatus: "pending"
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load company profile data when component mounts
  useEffect(() => {
    if (user) {
      loadCompanyData();
    }
  }, [user]);

  const loadCompanyData = async () => {
    try {
      setLoading(true);
      console.log('[CompanyProfile] Loading company data');
      const data = await api('/api/company');
      console.log('[CompanyProfile] Company data loaded:', data);
      
      // Map the database data to our profile structure
      setProfile({
        basicInfo: {
          companyName: data.name || "",
          registrationNumber: data.registrationNumber || "",
          address: data.address || "",
          phone: data.contactPhone || "",
          email: data.contactEmail || "",
          website: data.website || "",
          establishedYear: data.establishedYear || ""
        },
        certifications: {
          cidbGrade: data.cidbGrade || "",
          cidbExpiry: data.cidbExpiry || "",
          iso9001: data.iso9001 || false,
          iso14001: data.iso14001 || false,
          ohsas18001: data.ohsas18001 || false,
          contractorLicense: data.contractorLicense || "",
          licenseExpiry: data.licenseExpiry || "",
          customCertifications: data.customCertifications || []
        },
        experience: {
          yearsInOperation: data.yearsInOperation || "",
          totalProjects: data.totalProjects || "",
          totalValue: data.totalValue || "",
          specialties: data.specialties || [],
          majorProjects: data.majorProjects || []
        },
        team: {
          totalEmployees: data.totalEmployees || "",
          engineers: data.engineersCount || "",
          supervisors: data.supervisorsCount || "",
          technicians: data.techniciansCount || "",
          laborers: data.laborersCount || "",
          keyPersonnel: data.keyPersonnel || []
        },
        preferences: {
          categories: data.preferredCategories || [],
          locations: data.preferredLocations || [],
          budgetRange: data.budgetRange || ""
        },
        verificationStatus: data.verificationStatus || "pending"
      });
    } catch (error) {
      console.error('[CompanyProfile] Error loading company data:', error);
      // Don't show error for missing profile - this is normal for new users
      if (!error.message.includes('404') && !error.message.includes('not found')) {
        addToast('Failed to load company profile', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      console.log('[CompanyProfile] Saving profile data:', profile);
      
      // Map the profile data to the format expected by the API
      const updateData = {
        name: profile.basicInfo.companyName,
        registrationNumber: profile.basicInfo.registrationNumber,
        address: profile.basicInfo.address,
        contactPhone: profile.basicInfo.phone,
        contactEmail: profile.basicInfo.email,
        website: profile.basicInfo.website,
        establishedYear: profile.basicInfo.establishedYear,
        cidbGrade: profile.certifications.cidbGrade,
        cidbExpiry: profile.certifications.cidbExpiry || null,
        iso9001: profile.certifications.iso9001,
        iso14001: profile.certifications.iso14001,
        ohsas18001: profile.certifications.ohsas18001,
        contractorLicense: profile.certifications.contractorLicense,
        licenseExpiry: profile.certifications.licenseExpiry || null,
        customCertifications: profile.certifications.customCertifications,
        yearsInOperation: profile.experience.yearsInOperation,
        totalProjects: profile.experience.totalProjects,
        totalValue: profile.experience.totalValue,
        specialties: profile.experience.specialties,
        majorProjects: profile.experience.majorProjects,
        totalEmployees: profile.team.totalEmployees,
        engineersCount: profile.team.engineers,
        supervisorsCount: profile.team.supervisors,
        techniciansCount: profile.team.technicians,
        laborersCount: profile.team.laborers,
        keyPersonnel: profile.team.keyPersonnel,
        preferredCategories: profile.preferences.categories,
        preferredLocations: profile.preferences.locations,
        budgetRange: profile.preferences.budgetRange
      };

      await api('/api/company', {
        method: 'PUT',
        body: updateData
      });

      setIsEditing(false);
      addToast('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('[CompanyProfile] Error saving profile:', error);
      addToast('Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const getCompletionScore = () => {
    let completed = 0;
    let total = 0;

    // Basic info (7 fields)
    const basicFields = Object.values(profile.basicInfo);
    total += basicFields.length;
    completed += basicFields.filter(value => value && value.trim()).length;

    // Certifications (7 core fields + custom)
    total += 7;
    if (profile.certifications.cidbGrade) completed++;
    if (profile.certifications.cidbExpiry) completed++;
    if (profile.certifications.contractorLicense) completed++;
    if (profile.certifications.licenseExpiry) completed++;
    if (profile.certifications.iso9001) completed++;
    if (profile.certifications.iso14001) completed++;
    if (profile.certifications.ohsas18001) completed++;
    if (profile.certifications.customCertifications.length > 0) completed++;

    // Experience (5 fields including major projects)
    total += 5;
    if (profile.experience.yearsInOperation) completed++;
    if (profile.experience.totalProjects) completed++;
    if (profile.experience.specialties.length > 0) completed++;
    if (profile.experience.majorProjects.length > 0) completed++;
    if (profile.experience.totalValue) completed++;

    // Team (6 fields including key personnel)
    total += 6;
    if (profile.team.totalEmployees) completed++;
    if (profile.team.engineers) completed++;
    if (profile.team.supervisors) completed++;
    if (profile.team.technicians) completed++;
    if (profile.team.laborers) completed++;
    if (profile.team.keyPersonnel.length > 0) completed++;

    return Math.round((completed / total) * 100);
  };

  const getVerificationBadge = (status) => {
    switch (status) {
      case 'verified':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="w-3 h-3 mr-1" />
            Pending Verification
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <AlertCircle className="w-3 h-3 mr-1" />
            Verification Required
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Not Verified
          </Badge>
        );
    }
  };

  const completionScore = getCompletionScore();

  // Show loading state
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="skeleton h-8 w-1/3"></div>
          <div className="skeleton h-32 w-full"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton h-64 w-full"></div>
            ))}
          </div>
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
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">Company Profile</h1>
              {getVerificationBadge(profile.verificationStatus)}
            </div>
            <p className="text-gray-600">
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
          <div className="space-y-6">
            {/* Core Certifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5" />
                  <span>Core Certifications & Licenses</span>
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

            {/* Dynamic Certifications */}
            <CertificationsList
              customCertifications={profile.certifications.customCertifications}
              onCertificationsChange={(certifications) => setProfile({
                ...profile,
                certifications: { ...profile.certifications, customCertifications: certifications }
              })}
              readOnly={!isEditing}
            />
          </div>
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
                        {isEditing && (
                          <button
                            onClick={() => {
                              const updatedSpecialties = [...profile.experience.specialties];
                              updatedSpecialties.splice(index, 1);
                              setProfile({
                                ...profile,
                                experience: { ...profile.experience, specialties: updatedSpecialties }
                              });
                            }}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                  {isEditing && (
                    <div className="flex space-x-2">
                      <Input 
                        placeholder="Add specialty (press Enter)"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.target.value.trim()) {
                            e.preventDefault();
                            const newSpecialty = e.target.value.trim();
                            if (!profile.experience.specialties.includes(newSpecialty)) {
                              setProfile({
                                ...profile,
                                experience: { 
                                  ...profile.experience, 
                                  specialties: [...profile.experience.specialties, newSpecialty] 
                                }
                              });
                              e.target.value = '';
                            }
                          }
                        }}
                      />
                      <Button
                        onClick={(e) => {
                          const input = e.target.previousSibling;
                          if (input.value.trim()) {
                            const newSpecialty = input.value.trim();
                            if (!profile.experience.specialties.includes(newSpecialty)) {
                              setProfile({
                                ...profile,
                                experience: { 
                                  ...profile.experience, 
                                  specialties: [...profile.experience.specialties, newSpecialty] 
                                }
                              });
                              input.value = '';
                            }
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Major Projects */}
            <MajorProjectsList
              majorProjects={profile.experience.majorProjects}
              onProjectsChange={(projects) => setProfile({
                ...profile,
                experience: { ...profile.experience, majorProjects: projects }
              })}
              readOnly={!isEditing}
            />
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
                  <div className="text-2xl font-bold text-blue-600">{profile.team.totalEmployees || "0"}</div>
                  <div className="text-sm text-gray-600">Total Employees</div>
                  {isEditing && (
                    <Input
                      value={profile.team.totalEmployees}
                      onChange={(e) => setProfile({
                        ...profile,
                        team: { ...profile.team, totalEmployees: e.target.value }
                      })}
                      className="mt-2"
                      placeholder="0"
                    />
                  )}
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{profile.team.engineers || "0"}</div>
                  <div className="text-sm text-gray-600">Engineers</div>
                  {isEditing && (
                    <Input
                      value={profile.team.engineers}
                      onChange={(e) => setProfile({
                        ...profile,
                        team: { ...profile.team, engineers: e.target.value }
                      })}
                      className="mt-2"
                      placeholder="0"
                    />
                  )}
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{profile.team.supervisors || "0"}</div>
                  <div className="text-sm text-gray-600">Supervisors</div>
                  {isEditing && (
                    <Input
                      value={profile.team.supervisors}
                      onChange={(e) => setProfile({
                        ...profile,
                        team: { ...profile.team, supervisors: e.target.value }
                      })}
                      className="mt-2"
                      placeholder="0"
                    />
                  )}
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{profile.team.technicians || "0"}</div>
                  <div className="text-sm text-gray-600">Technicians</div>
                  {isEditing && (
                    <Input
                      value={profile.team.technicians}
                      onChange={(e) => setProfile({
                        ...profile,
                        team: { ...profile.team, technicians: e.target.value }
                      })}
                      className="mt-2"
                      placeholder="0"
                    />
                  )}
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{profile.team.laborers || "0"}</div>
                  <div className="text-sm text-gray-600">Laborers</div>
                  {isEditing && (
                    <Input
                      value={profile.team.laborers}
                      onChange={(e) => setProfile({
                        ...profile,
                        team: { ...profile.team, laborers: e.target.value }
                      })}
                      className="mt-2"
                      placeholder="0"
                    />
                  )}
                </div>
              </div>

              {/* Key Personnel */}
              <KeyPersonnelList
                keyPersonnel={profile.team.keyPersonnel}
                onPersonnelChange={(personnel) => setProfile({
                  ...profile,
                  team: { ...profile.team, keyPersonnel: personnel }
                })}
                readOnly={!isEditing}
              />
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
                        {isEditing && (
                          <button
                            onClick={() => {
                              const updatedCategories = [...profile.preferences.categories];
                              updatedCategories.splice(index, 1);
                              setProfile({
                                ...profile,
                                preferences: { ...profile.preferences, categories: updatedCategories }
                              });
                            }}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                  {isEditing && (
                    <div className="flex space-x-2">
                      <Input 
                        placeholder="Add category (press Enter)"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.target.value.trim()) {
                            e.preventDefault();
                            const newCategory = e.target.value.trim();
                            if (!profile.preferences.categories.includes(newCategory)) {
                              setProfile({
                                ...profile,
                                preferences: { 
                                  ...profile.preferences, 
                                  categories: [...profile.preferences.categories, newCategory] 
                                }
                              });
                              e.target.value = '';
                            }
                          }
                        }}
                      />
                      <Button
                        onClick={(e) => {
                          const input = e.target.previousSibling;
                          if (input.value.trim()) {
                            const newCategory = input.value.trim();
                            if (!profile.preferences.categories.includes(newCategory)) {
                              setProfile({
                                ...profile,
                                preferences: { 
                                  ...profile.preferences, 
                                  categories: [...profile.preferences.categories, newCategory] 
                                }
                              });
                              input.value = '';
                            }
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
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
                        {isEditing && (
                          <button
                            onClick={() => {
                              const updatedLocations = [...profile.preferences.locations];
                              updatedLocations.splice(index, 1);
                              setProfile({
                                ...profile,
                                preferences: { ...profile.preferences, locations: updatedLocations }
                              });
                            }}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                  {isEditing && (
                    <div className="flex space-x-2">
                      <Input 
                        placeholder="Add location (press Enter)"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.target.value.trim()) {
                            e.preventDefault();
                            const newLocation = e.target.value.trim();
                            if (!profile.preferences.locations.includes(newLocation)) {
                              setProfile({
                                ...profile,
                                preferences: { 
                                  ...profile.preferences, 
                                  locations: [...profile.preferences.locations, newLocation] 
                                }
                              });
                              e.target.value = '';
                            }
                          }
                        }}
                      />
                      <Button
                        onClick={(e) => {
                          const input = e.target.previousSibling;
                          if (input.value.trim()) {
                            const newLocation = input.value.trim();
                            if (!profile.preferences.locations.includes(newLocation)) {
                              setProfile({
                                ...profile,
                                preferences: { 
                                  ...profile.preferences, 
                                  locations: [...profile.preferences.locations, newLocation] 
                                }
                              });
                              input.value = '';
                            }
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
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