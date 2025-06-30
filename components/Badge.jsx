// components/Badge.jsx
// Enhanced badge component using class-variance-authority for variant management
// Provides consistent styling with proper Tailwind CSS class merging

import React from 'react';
import { cva } from "class-variance-authority";
import { cn } from '../lib/utils';

// Define badge variants using class-variance-authority
const badgeVariants = cva(
  // Base classes applied to all badges
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-blue-600 text-white hover:bg-blue-700",
        secondary: "border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200",
        destructive: "border-transparent bg-red-100 text-red-800 hover:bg-red-200",
        outline: "border-gray-300 text-gray-700 hover:bg-gray-50",
        success: "border-transparent bg-green-100 text-green-800 hover:bg-green-200",
        warning: "border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
        error: "border-transparent bg-red-100 text-red-800 hover:bg-red-200",
        info: "border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200"
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Badge = React.forwardRef(({ className, variant, ...props }, ref) => {
  return (
    <div 
      className={cn(badgeVariants({ variant }), className)} 
      ref={ref}
      {...props} 
    />
  );
});

Badge.displayName = "Badge";


export { Badge, badgeVariants };