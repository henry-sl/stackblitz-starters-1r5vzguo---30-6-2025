import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Building, 
  Clock,
  Sparkles
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Mock tender data
const mockTenders = [
  {
    id: "1",
    title: "Road Maintenance and Repair Services - Kuala Lumpur District",
    agency: "Kuala Lumpur City Hall (DBKL)",
    category: "Construction",
    location: "Kuala Lumpur",
    budget: "RM 2,500,000",
    closingDate: new Date("2025-02-15"),
    description: "Comprehensive road maintenance including pothole repairs, resurfacing, and drainage improvements across major roads in KL district.",
    requirements: ["CIDB Grade G4 or above", "Minimum 5 years experience", "Valid contractor license"],
    status: "new",
    tags: ["Road Works", "Maintenance", "Urban"]
  },
  {
    id: "2",
    title: "IT Infrastructure Upgrade for Government Buildings",
    agency: "Ministry of Digital Development",
    category: "Information Technology",
    location: "Putrajaya",
    budget: "RM 1,800,000",
    closingDate: new Date("2025-02-20"),
    description: "Network infrastructure modernization including server upgrades, security systems, and cloud migration services.",
    requirements: ["MSC Status preferred", "ISO 27001 certification", "Minimum 3 years experience"],
    status: "closing-soon",
    tags: ["IT", "Cloud", "Security"]
  },
  {
    id: "3",
    title: "School Building Construction - Selangor",
    agency: "Ministry of Education",
    category: "Construction",
    location: "Selangor",
    budget: "RM 8,500,000",
    closingDate: new Date("2025-03-01"),
    description: "Construction of new primary school building with modern facilities, including classrooms, library, and sports facilities.",
    requirements: ["CIDB Grade G6 or above", "Minimum 10 years experience", "Previous school construction experience"],
    status: "active",
    tags: ["Construction", "Education", "New Build"]
  },
  {
    id: "4",
    title: "Waste Management System Implementation",
    agency: "Selangor State Government",
    category: "Environmental",
    location: "Shah Alam",
    budget: "RM 3,200,000",
    closingDate: new Date("2025-02-25"),
    description: "Implementation of smart waste management system including IoT sensors, collection optimization, and recycling programs.",
    requirements: ["Environmental certification", "IoT experience", "Waste management expertise"],
    status: "active",
    tags: ["Environment", "IoT", "Smart City"]
  }
];

export const TenderFeed = (): JSX.Element => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");

  const categories = ["all", "Construction", "Information Technology", "Environmental"];
  const locations = ["all", "Kuala Lumpur", "Putrajaya", "Selangor", "Shah Alam"];

  const filteredTenders = mockTenders.filter(tender => {
    const matchesSearch = tender.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tender.agency.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tender.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || tender.category === selectedCategory;
    const matchesLocation = selectedLocation === "all" || tender.location === selectedLocation;
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">New</Badge>;
      case "closing-soon":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Closing Soon</Badge>;
      default:
        return <Badge variant="secondary">Active</Badge>;
    }
  };

  const getDaysUntilClosing = (closingDate: Date) => {
    return formatDistanceToNow(closingDate, { addSuffix: true });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Tenders</h1>
        <p className="text-gray-600">Discover and bid on government and private sector opportunities</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search tenders by title, agency, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === "all" ? "All Categories" : category}
              </option>
            ))}
          </select>

          {/* Location Filter */}
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {locations.map(location => (
              <option key={location} value={location}>
                {location === "all" ? "All Locations" : location}
              </option>
            ))}
          </select>

          <Button variant="outline" className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>More Filters</span>
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {filteredTenders.length} of {mockTenders.length} tenders
        </p>
      </div>

      {/* Tender Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {filteredTenders.map((tender) => (
          <Card key={tender.id} className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-blue-500">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {tender.title}
                  </CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <Building className="w-4 h-4" />
                      <span>{tender.agency}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{tender.location}</span>
                    </div>
                  </div>
                </div>
                {getStatusBadge(tender.status)}
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {tender.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {tender.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Tender Details */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-500">Budget:</span>
                  <p className="font-semibold text-gray-900">{tender.budget}</p>
                </div>
                <div>
                  <span className="text-gray-500">Closing:</span>
                  <p className="font-semibold text-gray-900 flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{getDaysUntilClosing(tender.closingDate)}</span>
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <Link to={`/tender/${tender.id}`} className="flex-1">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    View Details
                  </Button>
                </Link>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Assist</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredTenders.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No tenders found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search criteria or filters to find more opportunities.
          </p>
          <Button variant="outline" onClick={() => {
            setSearchTerm("");
            setSelectedCategory("all");
            setSelectedLocation("all");
          }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};