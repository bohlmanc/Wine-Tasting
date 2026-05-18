import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';

import HomeScreen from '../screens/HomeScreen';
import AddWineTypeScreen from '../screens/AddWineTypeScreen';
import BasicInfoScreen from '../screens/tasting/BasicInfoScreen';
import WineStyleScreen from '../screens/tasting/WineStyleScreen';
import LookColorScreen from '../screens/tasting/LookColorScreen';
import LookDetailsScreen from '../screens/tasting/LookDetailsScreen';
import SmellMainScreen from '../screens/tasting/SmellMainScreen';
import SmellFruitTypeScreen from '../screens/tasting/SmellFruitTypeScreen';
import SmellFruitDetailScreen from '../screens/tasting/SmellFruitDetailScreen';
import SmellHerbsSpicesScreen from '../screens/tasting/SmellHerbsSpicesScreen';
import SmellHerbSpiceDetailScreen from '../screens/tasting/SmellHerbSpiceDetailScreen';
import SmellOutdoorOtherScreen from '../screens/tasting/SmellOutdoorOtherScreen';
import TasteScreen from '../screens/tasting/TasteScreen';
import ThinkScreen from '../screens/tasting/ThinkScreen';
import MyTastingsScreen from '../screens/MyTastingsScreen';
import TastingCalendarScreen from '../screens/TastingCalendarScreen';
import WineDetailScreen from '../screens/WineDetailScreen';
import WineTastingGuideScreen from '../screens/WineTastingGuideScreen';
import MyProfileScreen from '../screens/MyProfileScreen';
import ScanLabelScreen from '../screens/ScanLabelScreen';
import WineryCheckInScreen from '../screens/WineryCheckInScreen';
import WinerySearchScreen from '../screens/WinerySearchScreen';
import WineryDetailScreen from '../screens/WineryDetailScreen';
import TastingFlightDetailScreen from '../screens/TastingFlightDetailScreen';
import GuidedSessionScreen from '../screens/GuidedSessionScreen';
import MyFlightsScreen from '../screens/MyFlightsScreen';
import CompletedFlightDetailScreen from '../screens/CompletedFlightDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AddWineType" component={AddWineTypeScreen} />
        <Stack.Screen name="BasicInfo" component={BasicInfoScreen} />
        <Stack.Screen name="ScanLabel" component={ScanLabelScreen} />
        <Stack.Screen name="WineStyle" component={WineStyleScreen} />
        <Stack.Screen name="LookColor" component={LookColorScreen} />
        <Stack.Screen name="LookDetails" component={LookDetailsScreen} />
        <Stack.Screen name="SmellMain" component={SmellMainScreen} />
        <Stack.Screen name="SmellFruitType" component={SmellFruitTypeScreen} />
        <Stack.Screen name="SmellFruitDetail" component={SmellFruitDetailScreen} />
        <Stack.Screen name="SmellHerbsSpices" component={SmellHerbsSpicesScreen} />
        <Stack.Screen name="SmellHerbSpiceDetail" component={SmellHerbSpiceDetailScreen} />
        <Stack.Screen name="SmellOutdoorOther" component={SmellOutdoorOtherScreen} />
        <Stack.Screen name="Taste" component={TasteScreen} />
        <Stack.Screen name="Think" component={ThinkScreen} />
        <Stack.Screen name="MyTastings" component={MyTastingsScreen} />
        <Stack.Screen name="TastingCalendar" component={TastingCalendarScreen} />
        <Stack.Screen name="WineDetail" component={WineDetailScreen} />
        <Stack.Screen name="WineTastingGuide" component={WineTastingGuideScreen} />
        <Stack.Screen name="MyProfile" component={MyProfileScreen} />
        <Stack.Screen name="WineryCheckIn" component={WineryCheckInScreen} />
        <Stack.Screen name="WinerySearch" component={WinerySearchScreen} />
        <Stack.Screen name="WineryDetail" component={WineryDetailScreen} />
        <Stack.Screen name="TastingFlightDetail" component={TastingFlightDetailScreen} />
        <Stack.Screen name="GuidedSession" component={GuidedSessionScreen} />
        <Stack.Screen name="MyFlights" component={MyFlightsScreen} />
        <Stack.Screen name="CompletedFlightDetail" component={CompletedFlightDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
