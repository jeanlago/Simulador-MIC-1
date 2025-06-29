import React, { useState, useLayoutEffect, useRef } from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';

export interface TutorialStep {
  selector: string;
  title: string;
  content: string;
}

interface Props {
  steps: TutorialStep[];
  isActive: boolean;
  onComplete: () => void;
}

export default function TutorialGuide({ steps, isActive, onComplete }: Props) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [balloonPosition, setBalloonPosition] = useState({});
  const balloonRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!isActive || !steps[currentStepIndex]) return;

    const element = document.querySelector(steps[currentStepIndex].selector);
    if (element) {
      // ✅ CORREÇÃO: 'instant' alterado para 'auto'
      element.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'center' });
      const rect = element.getBoundingClientRect();
      setTargetRect(rect);
    }
  }, [currentStepIndex, isActive, steps]);

  useLayoutEffect(() => {
    if (targetRect && balloonRef.current) {
      const balloonRect = balloonRef.current.getBoundingClientRect();
      const margin = 16;
      let top = targetRect.bottom + margin;
      if (top + balloonRect.height > window.innerHeight) {
        top = targetRect.top - balloonRect.height - margin;
      }
      let left = targetRect.left + (targetRect.width / 2) - (balloonRect.width / 2);
      if (left < margin) {
        left = margin;
      }
      if (left + balloonRect.width > window.innerWidth - margin) {
        left = window.innerWidth - balloonRect.width - margin;
      }
      setBalloonPosition({ top, left });
    }
  }, [targetRect]);

  const handleNext = () => {
    setTargetRect(null);
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onComplete();
    }
  };

  if (!isActive) {
    return null;
  }

  const currentStep = steps[currentStepIndex];

  return (
    <Box sx={{ pointerEvents: 'none' }}>
      {targetRect && (
        <Box
          sx={{
            position: 'fixed',
            top: `${targetRect.top}px`,
            left: `${targetRect.left}px`,
            width: `${targetRect.width}px`,
            height: `${targetRect.height}px`,
            boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.65)`,
            borderRadius: '4px',
            transition: 'all 0.35s ease-in-out',
            zIndex: 1301,
          }}
        />
      )}
      
      {targetRect && (
        <Paper
          ref={balloonRef}
          elevation={10}
          sx={{
            position: 'fixed',
            visibility: Object.keys(balloonPosition).length > 0 ? 'visible' : 'hidden',
            ...balloonPosition,
            maxWidth: 350,
            padding: 2,
            zIndex: 1302,
            transition: 'all 0.35s ease-in-out, opacity 0.2s linear',
            pointerEvents: 'auto',
          }}
        >
          <Typography variant="h6" gutterBottom>{currentStep.title}</Typography>
          <Typography variant="body2" sx={{ my: 2 }}>{currentStep.content}</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption">
              Passo {currentStepIndex + 1} de {steps.length}
            </Typography>
            <Button variant="contained" onClick={handleNext}>
              {currentStepIndex === steps.length - 1 ? 'Finalizar' : 'Próximo'}
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
}