'use client';

import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';

interface Application {
  id: number;
  jobTitle: string;
  company: string;
  status: string;
}

export function LadderProgression() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ladder Progression</CardTitle>
      </CardHeader>
      <CardContent>
        <Progress value={33} className="w-full" />
        <p className="text-sm text-center mt-2">33% to next rank</p>
      </CardContent>
    </Card>
  );
}

export function RewardBalance() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reward Balance</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">1,250 Tokens</p>
        <p className="text-sm text-muted-foreground">Earned from vetting</p>
      </CardContent>
    </Card>
  );
}

interface ApplicationTrackerProps {
  applications: Application[];
}

export function ApplicationTracker({ applications }: ApplicationTrackerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {applications.map((app) => (
            <li key={app.id} className="flex justify-between items-center">
              <div>
                <p className="font-medium">{app.jobTitle}</p>
                <p className="text-sm text-muted-foreground">{app.company}</p>
              </div>
              <Badge>{app.status}</Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}