'use client';

import { useState } from 'react';
import { useContract } from '../../contexts/ContractContext';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';

import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface SubmitValidationProps {
  projectOwner: string;
  projectTitle: string;
  onSuccess?: () => void;
}

export function SubmitValidation({ projectOwner, projectTitle, onSuccess }: SubmitValidationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [score, setScore] = useState<number>(0);
  const { submitValidation } = useContract();
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async () => {

    if (score < 0 || score > 100) {
    //   toast({
    //     title: "Invalid score",
    //     description: "Score must be between 0 and 100",
    //     variant: "destructive",
    //   });
      return;
    }

    setIsLoading(true);
    try {
      const tx = await submitValidation(projectOwner, projectTitle, score , "AxHCw4x8buZN2Cqw6kkQFLMpiFCotnX4kMNbQqjVx2fY");
      setIsOpen(false);
    //   toast({
    //     title: "Success",
    //     description: `Validation submitted. Transaction: ${tx.slice(0, 8)}...`,
    //   });
      onSuccess?.();
    } catch (error: any) {
    //   toast({
    //     title: "Error submitting validation",
    //     description: error.message,
    //     variant: "destructive",
    //   });
    }

    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Continue Vetting</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Project Validation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="score">Score (0-100)</Label>
            <Input
              id="score"
              type="number"
              min="0"
              max="100"
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
            />
          </div>
          <div className="flex justify-center gap-4">
            <Button
              variant="destructive"
              onClick={() => handleSubmit()}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Submit'}
            </Button>
        
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
