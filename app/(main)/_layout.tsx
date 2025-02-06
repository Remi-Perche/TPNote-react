import { Redirect, Stack } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'
import React from 'react'
import { SelectedFoodsProvider } from './selectedFoodContext'

export default function AuthRoutesLayout() {
  const { isSignedIn } = useAuth()

  if (!isSignedIn) {
    return <Redirect href={'/sign-in'} />
  }


  return (
    <SelectedFoodsProvider>
      <Stack screenOptions={{ headerShown: false }}/>
    </SelectedFoodsProvider>
  )
}