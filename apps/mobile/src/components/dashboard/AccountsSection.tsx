import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {AccountItem} from '../../lib/types';
import {CURRENCY} from '../../lib/constants';
import {colors} from '../../themes/colors';
import {uiLog} from '../../lib/logger';

interface AccountListItemProps {
  item: AccountItem;
  onPress?: (item: AccountItem) => void;
}

function AccountListItem({item, onPress}: AccountListItemProps) {
  const {name, subtitle, amount, badge, iconBgColor, Icon} = item;

  return (
    <TouchableOpacity
      onPress={() => onPress?.(item)}
      className="flex-row items-center justify-between py-4">
      <View className="flex-row items-center gap-4">
        {/* Circle Icon */}
        <View
          className="h-12 w-12 items-center justify-center rounded-full"
          style={{backgroundColor: iconBgColor}}>
          <Icon color={colors.textInverse} width={24} height={24} />
        </View>

        {/* Name and Subtitle */}
        <View>
          <Text className="text-text-primary text-[15px] font-bold">
            {name}
          </Text>
          {subtitle && (
            <Text className="text-text-secondary text-xs font-medium">
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {/* Amount and Badge */}
      <View className="items-end gap-1">
        <Text className="text-text-primary text-[15px] font-bold">
          {CURRENCY}{' '}
          {amount.toLocaleString('en-MY', {minimumFractionDigits: 2})}
        </Text>
        {badge && (
          <View className="bg-primary-light rounded-md px-2 py-0.5">
            <Text className="text-primary text-[10px] font-bold">
              {badge}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

interface AccountsSectionProps {
  title?: string;
  accounts: AccountItem[];
  onViewAll?: () => void;
  onAccountClick?: (item: AccountItem) => void;
}

export function AccountsSection({
  title = 'Accounts',
  accounts,
  onViewAll,
  onAccountClick,
}: AccountsSectionProps) {
  const handleViewAll = () => {
    uiLog.info('View all accounts clicked');
    onViewAll?.();
  };

  return (
    <View className="space-y-3 px-4">
      <Text className="text-text-primary text-lg font-bold">
        {title}
      </Text>
      <View className="rounded-2xl bg-white px-4 py-5">
        <View className="divide-y divide-gray-100">
          {accounts.map(account => (
            <AccountListItem
              key={account.id}
              item={account}
              onPress={onAccountClick}
            />
          ))}
        </View>
        <TouchableOpacity onPress={handleViewAll} className="mt-2 items-center">
          <Text className="text-primary text-[15px] font-bold">
            View all
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
