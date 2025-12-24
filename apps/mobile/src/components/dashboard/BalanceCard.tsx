import React, {useState} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import {ActionButton} from './ActionButton';
import {CURRENCY} from '../../lib/constants';
import {ActionButtonItem} from '../../lib/types';
import {colors} from '../../themes/colors';
import {uiLog} from '../../lib/logger';

interface BalanceCardProps {
  balance: number;
  interestEarned?: number;
  onBalanceClick?: () => void;
  actions: ActionButtonItem[];
}

export function BalanceCard({
  balance,
  interestEarned = 0.43,
  onBalanceClick,
  actions,
}: BalanceCardProps) {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  // React Compiler handles memoization automatically
  const balanceStr = balance.toLocaleString('en-MY', {
    minimumFractionDigits: 2,
  });
  const formattedBalance = isBalanceVisible
    ? balanceStr
    : balanceStr.replace(/\d/g, '*');

  const handleBalanceClick = () => {
    uiLog.info('Balance section clicked');
    onBalanceClick?.();
  };

  const handleToggleVisibility = () => {
    const newState = !isBalanceVisible;
    uiLog.info(`Balance visibility toggled: ${newState}`);
    setIsBalanceVisible(newState);
  };

  return (
    <View
      className="rounded-md px-4 py-4 bg-primary-light mt-2">
      {/* Total Balance Label */}
      <TouchableOpacity
        onPress={handleBalanceClick}
        className="mb-4 flex-row items-center justify-center">
        <Text className="text-text-primary/70 text-sm font-medium">
          Total balance
        </Text>
      </TouchableOpacity>

      {/* Balance Amount */}
      <View className="mb-4 flex-row items-center justify-center gap-2">
        <Text className="text-text-primary text-4xl font-medium tracking-tighter">
          {CURRENCY} {formattedBalance}
        </Text>
        <TouchableOpacity onPress={handleToggleVisibility} className="p-1.5">
          {isBalanceVisible ? (
            <Eye size={24} color={colors.textSecondary} />
          ) : (
            <EyeOff size={24} color={colors.textSecondary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Interest Earned */}
      <View className="mb-7 flex-row items-center justify-center gap-2">
        <Text className="text-text-primary text-sm font-medium">
          Interest earned
        </Text>
        <Text className="text-success text-sm font-bold">
          +{CURRENCY} {interestEarned.toFixed(2)}
        </Text>
      </View>

      {/* Actions Grid */}
      <View className="flex-row justify-around -mx-2 py-2">
        {actions.map(action => (
          <ActionButton key={action.id} {...action} />
        ))}
      </View>
    </View>
  );
}
