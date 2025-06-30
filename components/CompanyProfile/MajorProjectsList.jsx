// components/CompanyProfile/MajorProjectsList.jsx
// Component for managing major projects with detailed information
// Supports adding, editing, and removing project entries

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Plus, Edit2, Trash2, Building, Calendar, DollarSign, User } from 'lucide-react';

export default function MajorProjectsList({ 
  majorProjects = [], 
  onProjectsChange,
  readOnly = false 
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [newProject, setNewProject] = useState({
    name: '',
    client: '',
    value: '',
    year: '',
    completionDate: '',
    role: '',
    description: '',
    sector: '',
    location: ''
  });

  const projectSectors = [
    'Construction',
    'Infrastructure',
    'Oil & Gas',
    'Power & Energy',
    'Water & Sewerage',
    'Transportation',
    'Telecommunications',
    'Healthcare',
    'Education',
    'Commercial',
    'Residential',
    'Industrial'
  ];

  const projectRoles = [
    'Main Contractor',
    'Sub-contractor',
    'Specialist Contractor',
    'Consultant',
    'Project Manager',
    'Design & Build',
    'Supply & Install',
    'Maintenance'
  ];

  // Add new project
  const addProject = () => {
    if (!newProject.name.trim()) return;
    
    const project = {
      id: Date.now(),
      ...newProject,
      createdAt: new Date().toISOString()
    };
    
    onProjectsChange([...majorProjects, project]);
    resetForm();
  };

  // Update existing project
  const updateProject = () => {
    if (!newProject.name.trim()) return;
    
    onProjectsChange(
      majorProjects.map(project => 
        project.id === editingProject.id ? { ...editingProject, ...newProject } : project
      )
    );
    resetForm();
  };

  // Remove project
  const removeProject = (id) => {
    onProjectsChange(majorProjects.filter(project => project.id !== id));
  };

  // Start editing project
  const startEdit = (project) => {
    setEditingProject(project);
    setNewProject({ ...project });
    setShowAddForm(true);
  };

  // Reset form
  const resetForm = () => {
    setNewProject({
      name: '',
      client: '',
      value: '',
      year: '',
      completionDate: '',
      role: '',
      description: '',
      sector: '',
      location: ''
    });
    setEditingProject(null);
    setShowAddForm(false);
  };

  // Format currency value
  const formatValue = (value) => {
    if (!value) return '';
    // Simple formatting - in production you might want more sophisticated formatting
    return value.includes('RM') ? value : `RM ${value}`;
  };

  return (
    <div className="space-y-6">
      {/* Current Projects */}
      {majorProjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="w-5 h-5" />
              <span>Major Projects ({majorProjects.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {majorProjects.map((project) => (
                <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{project.name}</h4>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {project.sector && (
                          <Badge variant="outline">{project.sector}</Badge>
                        )}
                        {project.role && (
                          <Badge variant="secondary">{project.role}</Badge>
                        )}
                      </div>
                    </div>
                    {!readOnly && (
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(project)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProject(project.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    {project.client && (
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <label className="text-xs text-gray-500">Client</label>
                          <p className="text-sm font-medium">{project.client}</p>
                        </div>
                      </div>
                    )}
                    {project.value && (
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <div>
                          <label className="text-xs text-gray-500">Project Value</label>
                          <p className="text-sm font-medium">{formatValue(project.value)}</p>
                        </div>
                      </div>
                    )}
                    {(project.year || project.completionDate) && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <label className="text-xs text-gray-500">
                            {project.completionDate ? 'Completed' : 'Year'}
                          </label>
                          <p className="text-sm font-medium">
                            {project.completionDate 
                              ? new Date(project.completionDate).toLocaleDateString()
                              : project.year
                            }
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {project.location && (
                    <div className="mb-3">
                      <label className="text-xs text-gray-500">Location</label>
                      <p className="text-sm">{project.location}</p>
                    </div>
                  )}

                  {project.description && (
                    <div>
                      <label className="text-xs text-gray-500">Description</label>
                      <p className="text-sm text-gray-700 mt-1">{project.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Project Form */}
      {!readOnly && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {editingProject ? 'Edit Project' : 'Add Major Project'}
              </CardTitle>
              {!showAddForm && (
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Project
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
                      Project Name *
                    </label>
                    <Input
                      value={newProject.name}
                      onChange={(e) => setNewProject({
                        ...newProject,
                        name: e.target.value
                      })}
                      placeholder="Enter project name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client
                    </label>
                    <Input
                      value={newProject.client}
                      onChange={(e) => setNewProject({
                        ...newProject,
                        client: e.target.value
                      })}
                      placeholder="Client name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Value
                    </label>
                    <Input
                      value={newProject.value}
                      onChange={(e) => setNewProject({
                        ...newProject,
                        value: e.target.value
                      })}
                      placeholder="e.g., RM 2,500,000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year
                    </label>
                    <Input
                      value={newProject.year}
                      onChange={(e) => setNewProject({
                        ...newProject,
                        year: e.target.value
                      })}
                      placeholder="e.g., 2023"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Completion Date
                    </label>
                    <Input
                      type="date"
                      value={newProject.completionDate}
                      onChange={(e) => setNewProject({
                        ...newProject,
                        completionDate: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <Input
                      value={newProject.location}
                      onChange={(e) => setNewProject({
                        ...newProject,
                        location: e.target.value
                      })}
                      placeholder="Project location"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sector
                    </label>
                    <select
                      value={newProject.sector}
                      onChange={(e) => setNewProject({
                        ...newProject,
                        sector: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select sector</option>
                      {projectSectors.map(sector => (
                        <option key={sector} value={sector}>{sector}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <select
                      value={newProject.role}
                      onChange={(e) => setNewProject({
                        ...newProject,
                        role: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select role</option>
                      {projectRoles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Description
                  </label>
                  <textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject({
                      ...newProject,
                      description: e.target.value
                    })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of the project scope and your role"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button
                    onClick={editingProject ? updateProject : addProject}
                    disabled={!newProject.name.trim()}
                  >
                    {editingProject ? 'Update Project' : 'Add Project'}
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Empty State */}
      {majorProjects.length === 0 && !showAddForm && !readOnly && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="text-center py-8">
            <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Major Projects</h3>
            <p className="text-gray-600 mb-4">
              Add your major projects to showcase your experience and capabilities.
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Project
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}