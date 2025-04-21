'use client';

import { IconFilter, IconSearch } from '@tabler/icons-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';

interface JobListing {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
}

interface JobsSectionProps {
  jobListings: JobListing[];
  jobSearch: string;
  setJobSearch: (value: string) => void;
}

export function JobsSection({ jobListings, jobSearch, setJobSearch }: JobsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Search</CardTitle>
        <CardDescription>Find your next opportunity in Web3</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2 mb-4">
          <div className="relative flex-grow">
            <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              value={jobSearch}
              onChange={(e) => setJobSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button variant="outline">
            <IconFilter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
        <ul className="space-y-4">
          {jobListings.map((job) => (
            <li key={job.id} className="border p-4 rounded-md">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{job.title}</h4>
                  <p className="text-sm text-muted-foreground">{job.company}</p>
                  <p className="text-sm">{job.location}</p>
                </div>
                <Badge variant="secondary">{job.salary}</Badge>
              </div>
              <div className="mt-2 flex space-x-2">
                <Button size="sm">Apply</Button>
                <Button size="sm" variant="outline">Save</Button>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}