import React, { useState, useEffect, KeyboardEvent, ChangeEvent } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { api } from '../lib/api';
import { 
  Building2, 
  Save, 
  X,
  CheckCircle, 
  AlertCircle,
  Users,
  Award,
  MapPin,
  Phone,
  Mail,
  FileText,
  Plus
} from "lucide-react";

// TypeScript interfaces for profile data structure
interface BasicInfo {
  companyName: string;
  registrationNumber: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  establishedYear: string;
}

interface Certifications {
  cidbGrade: string;
  cidbExpiry: string;
  iso9001: boolean;
  iso14001: boolean;
  ohsas18001: boolean;
  contractorLicense: string;
  licenseExpiry: string;
}

interface MajorProject {
  name: string;
  year: string;
  value: string;
  client: string;
}

interface Experience {
  yearsInOperation: string;
  totalProjects: string;
  totalValue: string;
  specialties: string[];
  majorProjects: MajorProject[];
}

interface KeyPersonnel {
  name: string;
  position: string;
  experience: string;
  certifications: string[];
}

interface Team {
  totalEmployees: string;
  engineers: string;
  supervisors: string;
  technicians: string;
  laborers: string;
  keyPersonnel: KeyPersonnel[];
}

interface Preferences {
  categories: string[];
  locations: string[];
  budgetRange: string;
}

interface Profile {
  basicInfo: BasicInfo;
  certifications: Certifications;
  experience: Experience;
  team: Team;
  preferences: Preferences;
}

// Default empty profile
const defaultProfile: Profile = {
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
    licenseExpiry: ""
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
  }
};

export default function CompanyProfile(): JSX.Element {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // For adding new items
  const [newSpecialty, setNewSpecialty] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newCertification, setNewCertification] = useState("");
  const [personnelIndex, setPersonnelIndex] = useState(-1);

  // Load existing company data when component mounts
  useEffect(() => {
    loadCompanyData();
  }, []);

  // Function to fetch company profile data from existing API
  const loadCompanyData = async () => {
    try {
      setLoading(true);
      const data = await api('/api/company');
      
      // Transform flat API data to nested profile structure
      const transformedProfile: Profile = {
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
          licenseExpiry: data.licenseExpiry || ""
        },
        experience: {
          yearsInOperation: data.yearsInOperation || "",
          totalProjects: data.totalProjects || "",
          totalValue: data.totalValue || "",
          specialties: Array.isArray(data.certifications) ? data.certifications : [],
          majorProjects: Array.isArray(data.majorProjects) ? data.majorProjects : []
        },
        team: {
          totalEmployees: data.totalEmployees || "",
          engineers: data.engineers || "",
          supervisors: data.supervisors || "",
          technicians: data.technicians || "",
          laborers: data.laborers || "",
          keyPersonnel: Array.isArray(data.keyPersonnel) ? data.keyPersonnel : []
        },
        preferences: {
          categories: Array.isArray(data.categories) ? data.categories : [],
          locations: Array.isArray(data.locations) ? data.locations : [],
          budgetRange: data.budgetRange || ""
        }
      };
      
      setProfile(transformedProfile);
    } catch (error) {
      // Company profile might not exist yet, use defaults
      console.log('No existing profile found, using defaults');
      
      // Set mock data for development
      setProfile({
        basicInfo: {
          companyName: "Pembinaan Jaya Sdn Bhd",
          registrationNumber: "123456-A",
          address: "No. 123, Jalan Industri 2, Taman Perindustrian, 47100 Puchong, Selangor",
          phone: "+603-8051-2345",
          email: "info@pembinaan-jaya.com.my",
          website: "www.pembinaan-jaya.com.my",
          establishedYear: "2016"
        },
        certifications: {
          cidbGrade: "G5",
          cidbExpiry: "2026-12-31",
          iso9001: true,
          iso14001: false,
          ohsas18001: true,
          contractorLicense: "KL-2024-001234",
          licenseExpiry: "2026-06-30"
        },
        experience: {
          yearsInOperation: "8",
          totalProjects: "52",
          totalValue: "RM 15,200,000",
          specialties: ["Road Construction", "Infrastructure", "Maintenance", "Drainage Works"],
          majorProjects: [
            {
              name: "Federal Highway Maintenance Phase 2",
              year: "2023",
              value: "RM 1,200,000",
              client: "Malaysian Highway Authority"
            },
            {
              name: "Shah Alam Industrial Road Repairs",
              year: "2022",
              value: "RM 800,000",
              client: "Selangor State Government"
            },
            {
              name: "Klang Valley Drainage Improvement",
              year: "2021",
              value: "RM 950,000",
              client: "Department of Irrigation and Drainage"
            }
          ]
        },
        team: {
          totalEmployees: "25",
          engineers: "3",
          supervisors: "5",
          technicians: "12",
          laborers: "5",
          keyPersonnel: [
            {
              name: "Eng. Ahmad Hassan",
              position: "Project Manager",
              experience: "15 years",
              certifications: ["Professional Engineer", "Project Management"]
            },
            {
              name: "Encik Rahman Ali",
              position: "Site Supervisor",
              experience: "12 years",
              certifications: ["CIDB Certified", "Safety Officer"]
            }
          ]
        },
        preferences: {
          categories: ["Construction", "Infrastructure", "Maintenance"],
          locations: ["Kuala Lumpur", "Selangor", "Putrajaya"],
          budgetRange: "RM 500,000 - RM 5,000,000"
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Transform nested profile structure back to flat API format
      const flatData = {
        name: profile.basicInfo.companyName,
        registrationNumber: profile.basicInfo.registrationNumber,
        address: profile.basicInfo.address,
        contactPhone: profile.basicInfo.phone,
        contactEmail: profile.basicInfo.email,
        website: profile.basicInfo.website,
        establishedYear: profile.basicInfo.establishedYear,
        cidbGrade: profile.certifications.cidbGrade,
        cidbExpiry: profile.certifications.cidbExpiry,
        iso9001: profile.certifications.iso9001,
        iso14001: profile.certifications.iso14001,
        ohsas18001: profile.certifications.ohsas18001,
        contractorLicense: profile.certifications.contractorLicense,
        licenseExpiry: profile.certifications.licenseExpiry,
        yearsInOperation: profile.experience.yearsInOperation,
        totalProjects: profile.experience.totalProjects,
        totalValue: profile.experience.totalValue,
        certifications: profile.experience.specialties,
        majorProjects: profile.experience.majorProjects,
        totalEmployees: profile.team.totalEmployees,
        engineers: profile.team.engineers,
        supervisors: profile.team.supervisors,
        technicians: profile.team.technicians,
        laborers: profile.team.laborers,
        keyPersonnel: profile.team.keyPersonnel,
        categories: profile.preferences.categories,
        locations: profile.preferences.locations,
        budgetRange: profile.preferences.budgetRange
      };

      await api('/api/company', {
        method: 'PUT',
        body: flatData
      });
      
      setIsEditing(false);
      addToast("Profile updated successfully!", 'success');
    } catch (error) {
      addToast("Failed to update profile", 'error');
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
      if (value && value.toString().trim()) completed++;
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

    // Team (5 fields)
    total += 5;
    if (profile.team.totalEmployees) completed++;
    if (profile.team.engineers) completed++;
    if (profile.team.supervisors) completed++;
    if (profile.team.technicians) completed++;
    if (profile.team.laborers) completed++;

    // Preferences (3 fields)
    total += 3;
    if (profile.preferences.categories.length > 0) completed++;
    if (profile.preferences.locations.length > 0) completed++;
    if (profile.preferences.budgetRange) completed++;

    return Math.round((completed / total) * 100);
  };

  // Specialty management
  const addSpecialty = () => {
    if (newSpecialty.trim() && !profile.experience.specialties.includes(newSpecialty.trim())) {
      setProfile({
        ...profile,
        experience: {
          ...profile.experience,
          specialties: [...profile.experience.specialties, newSpecialty.trim()]
        }
      });
      setNewSpecialty("");
    }
  };

  const handleSpecialtyKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSpecialty();
    }
  };

  const removeSpecialty = (index: number) => {
    setProfile({
      ...profile,
      experience: {
        ...profile.experience,
        specialties: profile.experience.specialties.filter((_, i) => i !== index)
      }
    });
  };

  // Project management
  const addProject = () => {
    const newProject: MajorProject = {
      name: "",
      year: "",
      value: "",
      client: ""
    };
    setProfile({
      ...profile,
      experience: {
        ...profile.experience,
        majorProjects: [...profile.experience.majorProjects, newProject]
      }
    });
  };

  const updateProject = (index: number, field: keyof MajorProject, value: string) => {
    const updatedProjects = [...profile.experience.majorProjects];
    updatedProjects[index] = { ...updatedProjects[index], [field]: value };
    setProfile({
      ...profile,
      experience: {
        ...profile.experience,
        majorProjects: updatedProjects
      }
    });
  };

  const removeProject = (index: number) => {
    setProfile({
      ...profile,
      experience: {
        ...profile.experience,
        majorProjects: profile.experience.majorProjects.filter((_, i) => i !== index)
      }
    });
  };

  // Personnel management
  const addPersonnel = () => {
    const newPerson: KeyPersonnel = {
      name: "",
      position: "",
      experience: "",
      certifications: []
    };
    setProfile({
      ...profile,
      team: {
        ...profile.team,
        keyPersonnel: [...profile.team.keyPersonnel, newPerson]
      }
    });
  };

  const updatePersonnel = (index: number, field: keyof KeyPersonnel, value: string | string[]) => {
    const updatedPersonnel = [...profile.team.keyPersonnel];
    updatedPersonnel[index] = { ...updatedPersonnel[index], [field]: value };
    setProfile({
      ...profile,
      team: {
        ...profile.team,
        keyPersonnel: updatedPersonnel
      }
    });
  };

  const removePersonnel = (index: number) => {
    setProfile({
      ...profile,
      team: {
        ...profile.team,
        keyPersonnel: profile.team.keyPersonnel.filter((_, i) => i !== index)
      }
    });
  };

  const addPersonnelCertification = (index: number) => {
    if (newCertification.trim()) {
      const updatedPersonnel = [...profile.team.keyPersonnel];
      updatedPersonnel[index] = { 
        ...updatedPersonnel[index], 
        certifications: [...updatedPersonnel[index].certifications, newCertification.trim()]
      };
      setProfile({
        ...profile,
        team: {
          ...profile.team,
          keyPersonnel: updatedPersonnel
        }
      });
      setNewCertification("");
      setPersonnelIndex(-1);
    }
  };

  const removePersonnelCertification = (personnelIndex: number, certIndex: number) => {
    const updatedPersonnel = [...profile.team.keyPersonnel];
    updatedPersonnel[personnelIndex] = { 
      ...updatedPersonnel[personnelIndex], 
      certifications: updatedPersonnel[personnelIndex].certifications.filter((_, i) => i !== certIndex)
    };
    setProfile({
      ...profile,
      team: {
        ...profile.team,
        keyPersonnel: updatedPersonnel
      }
    });
  };

  // Category management
  const addCategory = () => {
    if (newCategory.trim() && !profile.preferences.categories.includes(newCategory.trim())) {
      setProfile({
        ...profile,
        preferences: {
          ...profile.preferences,
          categories: [...profile.preferences.categories, newCategory.trim()]
        }
      });
      setNewCategory("");
    }
  };

  const handleCategoryKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCategory();
    }
  };

  const removeCategory = (index: number) => {
    setProfile({
      ...profile,
      preferences: {
        ...profile.preferences,
        categories: profile.preferences.categories.filter((_, i) => i !== index)
      }
    });
  };

  // Location management
  const addLocation = () => {
    if (newLocation.trim() && !profile.preferences.locations.includes(newLocation.trim())) {
      setProfile({
        ...profile,
        preferences: {
          ...profile.preferences,
          locations: [...profile.preferences.locations, newLocation.trim()]
        }
      });
      setNewLocation("");
    }
  };

  const handleLocationKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addLocation();
    }
  };

  const removeLocation = (index: number) => {
    setProfile({
      ...profile,
      preferences: {
        ...profile.preferences,
        locations: profile.preferences.locations.filter((_, i) => i !== index)
      }
    });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="skeleton h-8 w-1/3"></div>
          <div className="skeleton h-32 w-full"></div>
          <div className="skeleton h-64 w-full"></div>
        </div>
      </div>
    );
  }

  const completionScore = getCompletionScore();

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
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setProfile({
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
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setProfile({
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
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setProfile({
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
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setProfile({
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
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setProfile({
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
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setProfile({
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
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setProfile({
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
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setProfile({
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
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setProfile({
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
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setProfile({
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
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setProfile({
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
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setProfile({
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
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setProfile({
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
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setProfile({
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
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setProfile({
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
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setProfile({
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
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setProfile({
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
                      <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                        <span>{specialty}</span>
                        {isEditing && (
                          <button
                            onClick={() => removeSpecialty(index)}
                            className="ml-1 text-gray-500 hover:text-red-500"
                            aria-label={`Remove ${specialty}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                  {isEditing && (
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Add specialty" 
                        value={newSpecialty}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setNewSpecialty(e.target.value)}
                        onKeyPress={handleSpecialtyKeyPress}
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={addSpecialty}
                        disabled={!newSpecialty.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
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
                            value={project.name}
                            disabled={!isEditing}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => updateProject(index, 'name', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Year
                          </label>
                          <Input
                            value={project.year}
                            disabled={!isEditing}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => updateProject(index, 'year', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Value
                          </label>
                          <Input
                            value={project.value}
                            disabled={!isEditing}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => updateProject(index, 'value', e.target.value)}
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Client
                          </label>
                          <Input
                            value={project.client}
                            disabled={!isEditing}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => updateProject(index, 'client', e.target.value)}
                          />
                        </div>
                        {isEditing && (
                          <div className="md:col-span-1 flex items-end">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => removeProject(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {isEditing && (
                  <Button variant="outline" className="mt-4" onClick={addProject}>
                    <Plus className="h-4 w-4 mr-1" />
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
                  <div className="text-2xl font-bold text-blue-600">{profile.team.totalEmployees || '0'}</div>
                  <div className="text-sm text-gray-600">Total Employees</div>
                  {isEditing && (
                    <Input
                      value={profile.team.totalEmployees}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setProfile({
                        ...profile,
                        team: { ...profile.team, totalEmployees: e.target.value }
                      })}
                      className="mt-2"
                      placeholder="0"
                    />
                  )}
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{profile.team.engineers || '0'}</div>
                  <div className="text-sm text-gray-600">Engineers</div>
                  {isEditing && (
                    <Input
                      value={profile.team.engineers}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setProfile({
                        ...profile,
                        team: { ...profile.team, engineers: e.target.value }
                      })}
                      className="mt-2"
                      placeholder="0"
                    />
                  )}
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{profile.team.supervisors || '0'}</div>
                  <div className="text-sm text-gray-600">Supervisors</div>
                  {isEditing && (
                    <Input
                      value={profile.team.supervisors}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setProfile({
                        ...profile,
                        team: { ...profile.team, supervisors: e.target.value }
                      })}
                      className="mt-2"
                      placeholder="0"
                    />
                  )}
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{profile.team.technicians || '0'}</div>
                  <div className="text-sm text-gray-600">Technicians</div>
                  {isEditing && (
                    <Input
                      value={profile.team.technicians}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setProfile({
                        ...profile,
                        team: { ...profile.team, technicians: e.target.value }
                      })}
                      className="mt-2"
                      placeholder="0"
                    />
                  )}
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{profile.team.laborers || '0'}</div>
                  <div className="text-sm text-gray-600">Laborers</div>
                  {isEditing && (
                    <Input
                      value={profile.team.laborers}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setProfile({
                        ...profile,
                        team: { ...profile.team, laborers: e.target.value }
                      })}
                      className="mt-2"
                      placeholder="0"
                    />
                  )}
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
                            value={person.name}
                            disabled={!isEditing}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => updatePersonnel(index, 'name', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Position
                          </label>
                          <Input
                            value={person.position}
                            disabled={!isEditing}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => updatePersonnel(index, 'position', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Experience
                          </label>
                          <Input
                            value={person.experience}
                            disabled={!isEditing}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => updatePersonnel(index, 'experience', e.target.value)}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Certifications
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {person.certifications && person.certifications.map((cert, certIndex) => (
                              <Badge key={certIndex} variant="outline" className="flex items-center">
                                {cert}
                                {isEditing && (
                                  <button
                                    onClick={() => removePersonnelCertification(index, certIndex)}
                                    className="ml-1 text-gray-500 hover:text-red-500"
                                    aria-label={`Remove ${cert}`}
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                )}
                              </Badge>
                            ))}
                          </div>
                          {isEditing && (
                            <div className="flex gap-2 mt-2">
                              <Input 
                                placeholder="Add certification" 
                                value={personnelIndex === index ? newCertification : ""}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                  setNewCertification(e.target.value);
                                  setPersonnelIndex(index);
                                }}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter' && personnelIndex === index) {
                                    e.preventDefault();
                                    addPersonnelCertification(index);
                                  }
                                }}
                              />
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => addPersonnelCertification(index)}
                                disabled={!newCertification.trim() || personnelIndex !== index}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                        {isEditing && (
                          <div className="md:col-span-1 flex items-end">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => removePersonnel(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {isEditing && (
                  <Button variant="outline" className="mt-4" onClick={addPersonnel}>
                    <Plus className="h-4 w-4 mr-1" />
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
                      <Badge key={index} className="bg-blue-100 text-blue-800 flex items-center">
                        {category}
                        {isEditing && (
                          <button
                            onClick={() => removeCategory(index)}
                            className="ml-1 text-blue-500 hover:text-red-500"
                            aria-label={`Remove ${category}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                  {isEditing && (
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Add category" 
                        value={newCategory}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setNewCategory(e.target.value)}
                        onKeyPress={handleCategoryKeyPress}
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={addCategory}
                        disabled={!newCategory.trim()}
                      >
                        <Plus className="h-4 w-4" />
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
                      <Badge key={index} className="bg-green-100 text-green-800 flex items-center">
                        {location}
                        {isEditing && (
                          <button
                            onClick={() => removeLocation(index)}
                            className="ml-1 text-green-500 hover:text-red-500"
                            aria-label={`Remove ${location}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                  {isEditing && (
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Add location" 
                        value={newLocation}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setNewLocation(e.target.value)}
                        onKeyPress={handleLocationKeyPress}
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={addLocation}
                        disabled={!newLocation.trim()}
                      >
                        <Plus className="h-4 w-4" />
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
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setProfile({
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
}