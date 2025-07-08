"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Users, CheckSquare, Briefcase, BookOpen, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Template {
  id: string
  name: string
  title: string
  content: string
  tags: string[]
  icon: React.ReactNode
  category: "business" | "personal" | "custom"
}

const defaultTemplates: Template[] = [
  {
    id: "meeting-notes",
    name: "Meeting Notes",
    title: "Meeting Notes - [Date]",
    content: `# Meeting Notes

**Date:** [Date]
**Attendees:** [List attendees]
**Duration:** [Duration]

## Agenda
- [ ] Item 1
- [ ] Item 2
- [ ] Item 3

## Discussion Points
### Topic 1
[Notes]

### Topic 2
[Notes]

## Action Items
- [ ] [Action] - Assigned to: [Person] - Due: [Date]
- [ ] [Action] - Assigned to: [Person] - Due: [Date]

## Next Steps
[Next steps and follow-up items]

## Next Meeting
**Date:** [Date]
**Time:** [Time]`,
    tags: ["meeting", "business", "notes"],
    icon: <Users className="w-4 h-4" />,
    category: "business",
  },
  {
    id: "blog-post",
    name: "Blog Post",
    title: "Blog Post Draft",
    content: `# [Blog Post Title]

**Published:** [Date]
**Author:** [Your Name]
**Tags:** [tag1, tag2, tag3]

## Introduction
[Hook your readers with an engaging opening paragraph]

## Main Content

### Section 1
[Your main points and supporting details]

### Section 2
[Continue developing your ideas]

### Section 3
[Additional insights or examples]

## Conclusion
[Summarize key points and provide a call-to-action]

---

**Meta Description:** [SEO description for search engines]
**Keywords:** [SEO keywords]`,
    tags: ["blog", "writing", "content"],
    icon: <BookOpen className="w-4 h-4" />,
    category: "personal",
  },
  {
    id: "task-list",
    name: "Task List",
    title: "Task List - [Project Name]",
    content: `# Task List - [Project Name]

**Created:** [Date]
**Priority:** [High/Medium/Low]
**Due Date:** [Date]

## High Priority
- [ ] [Task 1] - Due: [Date]
- [ ] [Task 2] - Due: [Date]

## Medium Priority
- [ ] [Task 3] - Due: [Date]
- [ ] [Task 4] - Due: [Date]

## Low Priority
- [ ] [Task 5] - Due: [Date]
- [ ] [Task 6] - Due: [Date]

## Completed ✅
- [x] [Completed task 1]
- [x] [Completed task 2]

## Notes
[Additional notes or context]`,
    tags: ["tasks", "productivity", "planning"],
    icon: <CheckSquare className="w-4 h-4" />,
    category: "personal",
  },
  {
    id: "project-plan",
    name: "Project Plan",
    title: "Project Plan - [Project Name]",
    content: `# Project Plan - [Project Name]

**Project Manager:** [Name]
**Start Date:** [Date]
**End Date:** [Date]
**Status:** [Planning/In Progress/Completed]

## Project Overview
[Brief description of the project]

## Objectives
- [Objective 1]
- [Objective 2]
- [Objective 3]

## Scope
### In Scope
- [Item 1]
- [Item 2]

### Out of Scope
- [Item 1]
- [Item 2]

## Timeline
| Phase | Start Date | End Date | Status |
|-------|------------|----------|--------|
| Phase 1 | [Date] | [Date] | [Status] |
| Phase 2 | [Date] | [Date] | [Status] |
| Phase 3 | [Date] | [Date] | [Status] |

## Resources
- **Team Members:** [List team members]
- **Budget:** [Budget amount]
- **Tools:** [Required tools/software]

## Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| [Risk 1] | [High/Medium/Low] | [High/Medium/Low] | [Mitigation strategy] |

## Success Criteria
- [Criteria 1]
- [Criteria 2]
- [Criteria 3]`,
    tags: ["project", "planning", "business"],
    icon: <Briefcase className="w-4 h-4" />,
    category: "business",
  },
]

interface TemplateSelectorProps {
  isOpen: boolean
  onClose: () => void
  onApplyTemplate: (template: Template) => void
}

export function TemplateSelector({ isOpen, onClose, onApplyTemplate }: TemplateSelectorProps) {
  const [customTemplates, setCustomTemplates] = useState<Template[]>([])
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    title: "",
    content: "",
    tags: "",
  })
  const [activeTab, setActiveTab] = useState("browse")
  const { toast } = useToast()

  const handleCreateTemplate = () => {
    if (!newTemplate.name || !newTemplate.content) {
      toast({
        title: "Missing fields",
        description: "Please fill in the template name and content.",
        variant: "destructive",
      })
      return
    }

    const template: Template = {
      id: `custom-${Date.now()}`,
      name: newTemplate.name,
      title: newTemplate.title || newTemplate.name,
      content: newTemplate.content,
      tags: newTemplate.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      icon: <FileText className="w-4 h-4" />,
      category: "custom",
    }

    setCustomTemplates([...customTemplates, template])
    setNewTemplate({ name: "", title: "", content: "", tags: "" })
    toast({
      title: "Template created",
      description: "Your custom template has been saved.",
    })
  }

  const handleApplyTemplate = (template: Template) => {
    onApplyTemplate(template)
  }

  const allTemplates = [...defaultTemplates, ...customTemplates]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Templates</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="browse">Browse Templates</TabsTrigger>
            <TabsTrigger value="create">Create Template</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allTemplates.map((template) => (
                <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {template.icon}
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                      </div>
                      <Badge variant={template.category === "custom" ? "default" : "secondary"}>
                        {template.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-1">
                        {template.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-sm text-muted-foreground line-clamp-3">
                        {template.content.substring(0, 150)}...
                      </div>
                      <Button onClick={() => handleApplyTemplate(template)} className="w-full">
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Template Name</label>
                  <Input
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    placeholder="e.g., Daily Standup Notes"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Default Title</label>
                  <Input
                    value={newTemplate.title}
                    onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                    placeholder="e.g., Daily Standup - [Date]"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Tags (comma-separated)</label>
                <Input
                  value={newTemplate.tags}
                  onChange={(e) => setNewTemplate({ ...newTemplate, tags: e.target.value })}
                  placeholder="e.g., standup, daily, team"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Template Content</label>
                <Textarea
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                  placeholder="Enter your template content here..."
                  className="min-h-[300px]"
                />
              </div>

              <Button onClick={handleCreateTemplate} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Save Template
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
