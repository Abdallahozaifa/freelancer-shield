import React from 'react';
import { Check, Clock, Send, X, AlertTriangle } from 'lucide-react';
import { Badge } from '../../../components/ui';
import type { ProposalStatus } from '../../../types';

interface ProposalStatusBadgeProps {
  status: ProposalStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<ProposalStatus, {
  label: string;
  variant: 'default' | 'success' | 'warning' | 'danger' | 'info';
  icon: React.ReactNode;
}> = {
  draft: {
    label: 'Draft',
    variant: 'default',
    icon: <Clock className="w-3 h-3" />,
  },
  sent: {
    label: 'Sent',
    variant: 'info',
    icon: <Send className="w-3 h-3" />,
  },
  accepted: {
    label: 'Accepted',
    variant: 'success',
    icon: <Check className="w-3 h-3" />,
  },
  declined: {
    label: 'Declined',
    variant: 'danger',
    icon: <X className="w-3 h-3" />,
  },
  expired: {
    label: 'Expired',
    variant: 'warning',
    icon: <AlertTriangle className="w-3 h-3" />,
  },
};

export const ProposalStatusBadge: React.FC<ProposalStatusBadgeProps> = ({
  status,
  size = 'sm',
}) => {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} size={size} className="gap-1">
      {config.icon}
      {config.label}
    </Badge>
  );
};
