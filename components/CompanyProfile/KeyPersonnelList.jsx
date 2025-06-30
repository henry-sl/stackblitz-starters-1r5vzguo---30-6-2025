// components/CompanyProfile/KeyPersonnelList.jsx
// Component for managing key personnel with CV uploads and role management
// Supports adding, editing, and removing personnel entries

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import FileUploader from './FileUploader';
import { Plus, Edit2, Trash2, User, Briefcase, Award, Upload } from 'lucide-react';

export default function KeyPersonnelList({ 
  keyPersonnel = [], 
  onPersonnelChange,
  readOnly = false 
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [newPerson, setNewPerson] = useState({
    name: '',
    position: '',
    experience: '',
    qualifications: '',
    certifications: [],
    cv: null,
    email: '',
    phone: ''
  });

  const commonPositions = [
    'Project Manager',
    'Site Manager',
    'Construction Manager',
    'Quantity Surveyor',
    'Site Engineer',
    'Safety Officer',
    'Quality Control Manager',
    'Architect',
    'Structural Engineer',
    'Mechanical Engineer',
    'Electrical Engineer',
    'Site Supervisor',
    'Foreman',
    'Technical Director',
    'Operations Manager'
  ];

  const commonCertifications = [
    'Professional Engineer (PE)',
    'Chartered Engineer',
    'Project Management Professional (PMP)',
    'CIDB Green Card',
    'Safety Passport',
    'First Aid Certificate',
    'NIOSH Safety Certificate',
    'ISO Lead Auditor',
    'Quality Control Certificate',
    'BIM Certification'
  ];

  // Add new person
  const addPerson = () => {
    if (!newPerson.name.trim() || !newPerson.position.trim()) return;
    
    const person = {
      id: Date.now(),
      ...newPerson,
      certifications: newPerson.certifications.filter(cert => cert.trim()),
      createdAt: new Date().toISOString()
    };
    
    onPersonnelChange([...keyPersonnel, person]);
    resetForm();
  };

  // Update existing person
  const updatePerson = () => {
    if (!newPerson.name.trim() || !newPerson.position.trim()) return;
    
    onPersonnelChange(
      keyPersonnel.map(person => 
        person.id === editingPerson.id 
          ? { 
              ...editingPerson, 
              ...newPerson,
              certifications: newPerson.certifications.filter(cert => cert.trim())
            } 
          : person
      )
    );
    resetForm();
  };

  // Remove person
  const removePerson = (id) => {
    onPersonnelChange(keyPersonnel.filter(person => person.id !== id));
  };

  // Start editing person
  const startEdit = (person) => {
    setEditingPerson(person);
    setNewPerson({ 
      ...person,
      certifications: person.certifications || []
    });
    setShowAddForm(true);
  };

  // Reset form
  const resetForm = () => {
    setNewPerson({
      name: '',
      position: '',
      experience: '',
      qualifications: '',
      certifications: [],
      cv: null,
      email: '',
      phone: ''
    });
    setEditingPerson(null);
    setShowAddForm(false);
  };

  // Add certification
  const addCertification = (certification) => {
    if (!newPerson.certifications.includes(certification)) {
      setNewPerson({
        ...newPerson,
        certifications: [...newPerson.certifications, certification]
      });
    }
  };

  // Remove certification
  const removeCertification = (index) => {
    setNewPerson({
      ...newPerson,
      certifications: newPerson.certifications.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-6">
      {/* Current Personnel */}
      {keyPersonnel.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Key Personnel ({keyPersonnel.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {keyPersonnel.map((person) => (
                <div key={person.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{person.name}</h4>
                      <div className="flex items-center space-x-2 mb-2">
                        <Briefcase className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{person.position}</span>
                      </div>
                    </div>
                    {!readOnly && (
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(person)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePerson(person.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    {person.experience && (
                      <div>
                        <label className="text-xs text-gray-500">Experience</label>
                        <p className="text-sm">{person.experience}</p>
                      </div>
                    )}
                    {person.qualifications && (
                      <div>
                        <label className="text-xs text-gray-500">Qualifications</label>
                        <p className="text-sm">{person.qualifications}</p>
                      </div>
                    )}
                    {person.email && (
                      <div>
                        <label className="text-xs text-gray-500">Email</label>
                        <p className="text-sm">{person.email}</p>
                      </div>
                    )}
                    {person.phone && (
                      <div>
                        <label className="text-xs text-gray-500">Phone</label>
                        <p className="text-sm">{person.phone}</p>
                      </div>
                    )}
                  </div>

                  {/* Certifications */}
                  {person.certifications && person.certifications.length > 0 && (
                    <div className="mb-3">
                      <label className="text-xs text-gray-500 mb-2 block">Certifications</label>
                      <div className="flex flex-wrap gap-2">
                        {person.certifications.map((cert, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <Award className="w-3 h-3 mr-1" />
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CV */}
                  {person.cv && (
                    <div className="border-t border-gray-100 pt-3">
                      <label className="text-xs text-gray-500 mb-2 block">CV/Resume</label>
                      <div className="flex items-center space-x-2">
                        <Upload className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-blue-600">{person.cv.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(person.cv.size / 1024 / 1024).toFixed(1)} MB)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Personnel Form */}
      {!readOnly && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {editingPerson ? 'Edit Personnel' : 'Add Key Personnel'}
              </CardTitle>
              {!showAddForm && (
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Personnel
                </Button>
              )}
            </div>
          </CardHeader>
          {showAddForm && (
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <Input
                      value={newPerson.name}
                      onChange={(e) => setNewPerson({
                        ...newPerson,
                        name: e.target.value
                      })}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Position *
                    </label>
                    <select
                      value={newPerson.position}
                      onChange={(e) => setNewPerson({
                        ...newPerson,
                        position: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select position</option>
                      {commonPositions.map(position => (
                        <option key={position} value={position}>{position}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Experience
                    </label>
                    <Input
                      value={newPerson.experience}
                      onChange={(e) => setNewPerson({
                        ...newPerson,
                        experience: e.target.value
                      })}
                      placeholder="e.g., 10+ years in construction"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Qualifications
                    </label>
                    <Input
                      value={newPerson.qualifications}
                      onChange={(e) => setNewPerson({
                        ...newPerson,
                        qualifications: e.target.value
                      })}
                      placeholder="e.g., B.Eng Civil Engineering"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={newPerson.email}
                      onChange={(e) => setNewPerson({
                        ...newPerson,
                        email: e.target.value
                      })}
                      placeholder="email@company.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <Input
                      value={newPerson.phone}
                      onChange={(e) => setNewPerson({
                        ...newPerson,
                        phone: e.target.value
                      })}
                      placeholder="+60-12-345-6789"
                    />
                  </div>
                </div>

                {/* Certifications */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certifications
                  </label>
                  
                  {/* Current certifications */}
                  {newPerson.certifications.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {newPerson.certifications.map((cert, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {cert}
                          <button
                            onClick={() => removeCertification(index)}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Add certifications */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {commonCertifications
                      .filter(cert => !newPerson.certifications.includes(cert))
                      .map(cert => (
                        <Button
                          key={cert}
                          variant="outline"
                          size="sm"
                          onClick={() => addCertification(cert)}
                          className="text-xs justify-start"
                        >
                          + {cert}
                        </Button>
                      ))}
                  </div>
                </div>

                {/* CV Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CV/Resume Upload
                  </label>
                  <FileUploader
                    onFileUpload={(file) => setNewPerson({
                      ...newPerson,
                      cv: file
                    })}
                    acceptedTypes=".pdf,.doc,.docx"
                    maxSize={5}
                    existingFiles={newPerson.cv ? [newPerson.cv] : []}
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button
                    onClick={editingPerson ? updatePerson : addPerson}
                    disabled={!newPerson.name.trim() || !newPerson.position.trim()}
                  >
                    {editingPerson ? 'Update Personnel' : 'Add Personnel'}
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Empty State */}
      {keyPersonnel.length === 0 && !showAddForm && !readOnly && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="text-center py-8">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Key Personnel</h3>
            <p className="text-gray-600 mb-4">
              Add your key personnel to showcase your team's expertise and qualifications.
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Team Member
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}