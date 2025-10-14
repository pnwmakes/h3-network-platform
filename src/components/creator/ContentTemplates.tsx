'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  FileText, 
  Plus, 
  Calendar,
  User,
  Building,
  Sparkles,
  Save
} from 'lucide-react';

interface ContentTemplate {
  id: string;
  type: 'VIDEO' | 'BLOG';
  title: string;
  description: string;
  showName?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  contentTopics: string[];
  guestNames: string[];
  guestBios: string[];
  sponsorNames: string[];
  sponsorMessages: string[];
}

export function ContentTemplates() {
  const [selectedType, setSelectedType] = useState<'VIDEO' | 'BLOG'>('VIDEO');
  const [template, setTemplate] = useState<Partial<ContentTemplate>>({
    type: 'VIDEO',
    title: '',
    description: '',
    showName: 'Noah & Rita Show',
    seasonNumber: 1,
    episodeNumber: 1,
    contentTopics: [],
    guestNames: [],
    guestBios: [],
    sponsorNames: [],
    sponsorMessages: [],
  });

  const [newTopic, setNewTopic] = useState('');
  const [newGuest, setNewGuest] = useState({ name: '', bio: '' });
  const [newSponsor, setNewSponsor] = useState({ name: '', message: '' });

  const handleInputChange = (field: string, value: string | number) => {
    setTemplate(prev => ({ ...prev, [field]: value }));
  };

  const addTopic = () => {
    if (newTopic.trim()) {
      setTemplate(prev => ({
        ...prev,
        contentTopics: [...(prev.contentTopics || []), newTopic.trim()]
      }));
      setNewTopic('');
    }
  };

  const removeTopic = (index: number) => {
    setTemplate(prev => ({
      ...prev,
      contentTopics: prev.contentTopics?.filter((_, i) => i !== index) || []
    }));
  };

  const addGuest = () => {
    if (newGuest.name.trim()) {
      setTemplate(prev => ({
        ...prev,
        guestNames: [...(prev.guestNames || []), newGuest.name.trim()],
        guestBios: [...(prev.guestBios || []), newGuest.bio.trim()]
      }));
      setNewGuest({ name: '', bio: '' });
    }
  };

  const removeGuest = (index: number) => {
    setTemplate(prev => ({
      ...prev,
      guestNames: prev.guestNames?.filter((_, i) => i !== index) || [],
      guestBios: prev.guestBios?.filter((_, i) => i !== index) || []
    }));
  };

  const addSponsor = () => {
    if (newSponsor.name.trim()) {
      setTemplate(prev => ({
        ...prev,
        sponsorNames: [...(prev.sponsorNames || []), newSponsor.name.trim()],
        sponsorMessages: [...(prev.sponsorMessages || []), newSponsor.message.trim()]
      }));
      setNewSponsor({ name: '', message: '' });
    }
  };

  const removeSponsor = (index: number) => {
    setTemplate(prev => ({
      ...prev,
      sponsorNames: prev.sponsorNames?.filter((_, i) => i !== index) || [],
      sponsorMessages: prev.sponsorMessages?.filter((_, i) => i !== index) || []
    }));
  };

  const saveTemplate = async () => {
    try {
      const response = await fetch('/api/content/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      });

      if (response.ok) {
        alert('Template saved successfully!');
      } else {
        alert('Failed to save template');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save template');
    }
  };

  return (
    <div className="space-y-6">
      {/* Template Type Selection */}
      <div className="flex space-x-4">
        <Button
          variant={selectedType === 'VIDEO' ? 'default' : 'outline'}
          onClick={() => {
            setSelectedType('VIDEO');
            setTemplate(prev => ({ ...prev, type: 'VIDEO' }));
          }}
          className="flex items-center"
        >
          <Video className="h-4 w-4 mr-2" />
          Video Template
        </Button>
        <Button
          variant={selectedType === 'BLOG' ? 'default' : 'outline'}
          onClick={() => {
            setSelectedType('BLOG');
            setTemplate(prev => ({ ...prev, type: 'BLOG' }));
          }}
          className="flex items-center"
        >
          <FileText className="h-4 w-4 mr-2" />
          Blog Template
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            {selectedType === 'VIDEO' ? (
              <Video className="h-5 w-5 mr-2" />
            ) : (
              <FileText className="h-5 w-5 mr-2" />
            )}
            {selectedType === 'VIDEO' ? 'Video Content Template' : 'Blog Content Template'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={template.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder={`Enter ${selectedType.toLowerCase()} title`}
              />
            </div>
            <div>
              <Label htmlFor="showName">Show Name</Label>
              <Input
                id="showName"
                value={template.showName || ''}
                onChange={(e) => handleInputChange('showName', e.target.value)}
                placeholder="e.g., Noah & Rita Show"
              />
            </div>
          </div>

          {/* Video-specific fields */}
          {selectedType === 'VIDEO' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="seasonNumber">Season Number</Label>
                <Input
                  id="seasonNumber"
                  type="number"
                  value={template.seasonNumber || ''}
                  onChange={(e) => handleInputChange('seasonNumber', parseInt(e.target.value))}
                  placeholder="1"
                />
              </div>
              <div>
                <Label htmlFor="episodeNumber">Episode Number</Label>
                <Input
                  id="episodeNumber"
                  type="number"
                  value={template.episodeNumber || ''}
                  onChange={(e) => handleInputChange('episodeNumber', parseInt(e.target.value))}
                  placeholder="1"
                />
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={template.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder={`Describe your ${selectedType.toLowerCase()} content...`}
              rows={3}
            />
          </div>

          {/* Content Topics */}
          <div>
            <Label>Content Topics</Label>
            <div className="flex space-x-2 mb-2">
              <Input
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="Add a topic (e.g., Criminal Justice Reform)"
                onKeyPress={(e) => e.key === 'Enter' && addTopic()}
              />
              <Button onClick={addTopic} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {template.contentTopics?.map((topic, index) => (
                <Badge key={index} variant="secondary" className="cursor-pointer"
                  onClick={() => removeTopic(index)}
                >
                  {topic} ×
                </Badge>
              ))}
            </div>
          </div>

          {/* Guest Information */}
          <div>
            <Label className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              Guest Information
            </Label>
            <div className="space-y-2 mb-2">
              <Input
                value={newGuest.name}
                onChange={(e) => setNewGuest(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Guest name"
              />
              <Textarea
                value={newGuest.bio}
                onChange={(e) => setNewGuest(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Guest bio/background"
                rows={2}
              />
              <Button onClick={addGuest} size="sm" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Guest
              </Button>
            </div>
            <div className="space-y-2">
              {template.guestNames?.map((name, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{name}</h4>
                      <p className="text-sm text-gray-600">{template.guestBios?.[index]}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeGuest(index)}
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sponsor Information */}
          <div>
            <Label className="flex items-center">
              <Building className="h-4 w-4 mr-2" />
              Sponsor Information
            </Label>
            <div className="space-y-2 mb-2">
              <Input
                value={newSponsor.name}
                onChange={(e) => setNewSponsor(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Sponsor name"
              />
              <Textarea
                value={newSponsor.message}
                onChange={(e) => setNewSponsor(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Sponsor message/acknowledgment"
                rows={2}
              />
              <Button onClick={addSponsor} size="sm" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Sponsor
              </Button>
            </div>
            <div className="space-y-2">
              {template.sponsorNames?.map((name, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{name}</h4>
                      <p className="text-sm text-gray-600">{template.sponsorMessages?.[index]}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSponsor(index)}
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-4">
            <Button onClick={saveTemplate} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Save Template
            </Button>
            <Button variant="outline" className="flex-1">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Content
            </Button>
            <Button variant="outline" className="flex-1">
              <Sparkles className="h-4 w-4 mr-2" />
              Create Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}