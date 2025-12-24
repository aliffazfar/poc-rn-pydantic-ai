import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Zap, Building2, Droplet, Wifi, CreditCard } from 'lucide-react-native';
import { CURRENCY } from '../../lib/constants';
import { colors } from '../../themes/colors';
import { uiLog } from '../../lib/logger';
import { GlassPill } from '../common/GlassButton';

type PaymentType = 'transfer' | 'bill';

interface BillerConfig {
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
}

interface InChatPaymentCardProps {
  type: PaymentType;

  // Common fields
  amount: number;
  reference?: string;

  // Transfer-specific fields (when type="transfer")
  recipientName?: string;
  bankName?: string;
  accountNumber?: string;

  // Bill-specific fields (when type="bill")
  billerName?: string;
  billerAccountNumber?: string;
  dueDate?: string;

  // Actions
  onApprove: () => void;
  onDecline: () => void;
  onEdit: () => void;
}

// Map biller names to icons and colors using switch case
function getBillerConfig(billerName: string): BillerConfig {
  const name = billerName.toLowerCase();

  // Determine biller type
  type BillerType =
    | 'electricity'
    | 'water'
    | 'telecom'
    | 'entertainment'
    | 'default';

  const getBillerType = (billerNameLower: string): BillerType => {
    switch (true) {
      case billerNameLower.includes('tenaga'):
      case billerNameLower.includes('tnb'):
        return 'electricity';

      case billerNameLower.includes('syabas'):
      case billerNameLower.includes('water'):
      case billerNameLower.includes('air'):
        return 'water';

      case billerNameLower.includes('tm'):
      case billerNameLower.includes('unifi'):
      case billerNameLower.includes('celcom'):
      case billerNameLower.includes('maxis'):
      case billerNameLower.includes('digi'):
        return 'telecom';

      case billerNameLower.includes('astro'):
        return 'entertainment';

      default:
        return 'default';
    }
  };

  const billerType = getBillerType(name);

  switch (billerType) {
    case 'electricity':
      return {
        icon: <Zap size={16} color="#713f12" />,
        bgColor: '#facc15', // yellow-400
        textColor: '#713f12', // yellow-900
      };

    case 'water':
      return {
        icon: <Droplet size={16} color="#1e3a5f" />,
        bgColor: '#60a5fa', // blue-400
        textColor: '#1e3a5f', // blue-900
      };

    case 'telecom':
      return {
        icon: <Wifi size={16} color="#581c87" />,
        bgColor: '#c084fc', // purple-400
        textColor: '#581c87', // purple-900
      };

    case 'entertainment':
      return {
        icon: <CreditCard size={16} color="#7f1d1d" />,
        bgColor: '#f87171', // red-400
        textColor: '#7f1d1d', // red-900
      };

    case 'default':
    default:
      return {
        icon: <Building2 size={16} color="#1e293b" />,
        bgColor: '#94a3b8', // slate-400
        textColor: '#1e293b', // slate-900
      };
  }
}

export function InChatPaymentCard({
  type,
  amount,
  reference,
  recipientName,
  bankName,
  accountNumber,
  billerName,
  billerAccountNumber,
  dueDate,
  onApprove,
  onDecline,
  onEdit,
}: InChatPaymentCardProps) {
  // Get display values based on payment type using switch
  const getDisplayConfig = () => {
    switch (type) {
      case 'transfer':
        return {
          isTransfer: true,
          isBill: false,
          displayName: recipientName,
          displayAccount: accountNumber,
          displaySubtitle: bankName,
          badgeText: 'Fund Transfer',
          badgeBg: '#292940', // blue-500/20
          badgeTextColor: colors.primary,
          headerText: 'Transfer',
          approveText: 'Approve',
          referenceText: reference || 'Funds Transfer',
          avatarBg: '#facc15', // yellow-400
          avatarText: '#000000',
          avatarContent: bankName?.charAt(0) || '?',
        };

      case 'bill':
      default: {
        const billerConfig = billerName ? getBillerConfig(billerName) : null;
        return {
          isTransfer: false,
          isBill: true,
          displayName: billerName,
          displayAccount: billerAccountNumber,
          displaySubtitle: dueDate ? `Due: ${dueDate}` : undefined,
          badgeText: 'Bill Payment',
          badgeBg: '#292940', // blue-500/20
          badgeTextColor: colors.primary,
          headerText: 'Bill Payment',
          approveText: 'Pay Now',
          referenceText: dueDate
            ? `Due: ${dueDate}`
            : reference || 'Bill Payment',
          avatarBg: billerConfig?.bgColor || '#94a3b8',
          avatarText: billerConfig?.textColor || '#1e293b',
          avatarContent: billerConfig?.icon || (
            <Building2 size={16} color="#1e293b" />
          ),
        };
      }
    }
  };

  const config = getDisplayConfig();

  uiLog.info(`💳 InChatPaymentCard: Rendering [${type}]`, {
    amount,
    recipient: recipientName,
    biller: billerName,
    configHeader: config.headerText,
  });

  const handleApprove = () => {
    uiLog.info(`${type} approved`, { amount });
    onApprove();
  };

  const handleDecline = () => {
    uiLog.info(`${type} declined`);
    onDecline();
  };

  const handleEdit = () => {
    uiLog.info(`${type} edit requested`);
    onEdit();
  };

  return (
    <View className="my-2 space-y-3">
      <View className="bg-glass-card border-glass-border w-full max-w-[90%] overflow-hidden rounded-2xl border p-1">
        {/* Card Content */}
        <View className="px-4 py-3">
          {/* Header */}
          <View className="mb-3 flex-row items-center gap-1">
            <Text className="text-text-inverse/50 text-[9px] font-extrabold tracking-widest">
              {config.headerText}
            </Text>
            <View
              className="rounded px-1 py-0.5"
              style={{ backgroundColor: 'rgba(59, 130, 246, 0.25)' }}
            >
              <Text className="text-[8px] font-bold tracking-tight text-blue-400">
                {config.badgeText}
              </Text>
            </View>
          </View>

          {/* Amount - white text on dark background */}
          <View className="mb-1">
            <Text className="text-text-inverse text-3xl font-extrabold tracking-tighter">
              {CURRENCY} {amount.toFixed(2)}
            </Text>
          </View>

          {/* Reference / Due Date Info */}
          <Text className="text-text-inverse/50 mb-4 text-[10px] font-semibold">
            {config.referenceText}
          </Text>

          {/* Recipient / Biller - dark glassmorphic box */}
          <View className="border-glass-border mx-0 flex-row items-center gap-2.5 rounded-xl border p-2.5">
            {/* Avatar */}
            <View
              className="h-9 w-9 items-center justify-center rounded-full"
              style={{
                backgroundColor: config.avatarBg,
              }}
            >
              {typeof config.avatarContent === 'string' ? (
                <Text
                  className="text-xs font-bold"
                  style={{ color: config.avatarText }}
                >
                  {config.avatarContent}
                </Text>
              ) : (
                config.avatarContent
              )}
            </View>

            {/* Name and Account - white text for dark theme */}
            <View className="flex-1 overflow-hidden">
              <Text
                className="text-text-inverse text-xs font-extrabold"
                numberOfLines={1}
              >
                {(config.displayName || 'Unknown').toUpperCase()}
              </Text>
              <Text className="text-text-inverse/50 text-[10px] font-semibold">
                {config.displayAccount || 'N/A'}
                {config.isTransfer &&
                  config.displaySubtitle &&
                  ` · ${config.displaySubtitle}`}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row items-center justify-between gap-2 px-3 pb-3 pt-1">
          {/* Left buttons */}
          <View className="flex-row gap-0.5">
            <TouchableOpacity
              onPress={handleDecline}
              className="h-8 items-center justify-center px-2.5"
              activeOpacity={0.7}
            >
              <Text className="text-[12px] font-bold text-primary">
                Decline
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleEdit}
              className="h-8 items-center justify-center px-2.5"
              activeOpacity={0.7}
            >
              <Text className="text-[12px] font-bold text-primary">Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Approve button - matching the glassy Ryt design with rainbow border */}
          <GlassPill
            width={100}
            height={36}
            onPress={handleApprove}
            blurAmount={25}
            backgroundOpacity={0}
            rainbowBorder={true}
          >
            <Text className="text-text-inverse text-[13px] font-bold">
              {config.approveText}
            </Text>
          </GlassPill>
        </View>
      </View>
    </View>
  );
}
