import { StyleSheet, Switch, View, type SwitchProps } from 'react-native';

import Theme from '@/constants/Theme';

type NeonSwitchProps = Omit<SwitchProps, 'trackColor' | 'thumbColor'>;

export default function NeonSwitch(props: NeonSwitchProps) {
  return (
    <View style={styles.wrap}>
      <Switch
        trackColor={{ false: Theme.background, true: 'rgba(168, 85, 247, 0.45)' }}
        thumbColor={props.value ? Theme.accent : Theme.textDim}
        ios_backgroundColor={Theme.background}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    transform: [{ scale: 0.9 }],
  },
});
