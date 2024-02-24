import { StyleSheet, View, ActivityIndicator } from 'react-native'
import React from 'react'

const Loader = (props) => {
  return (
    <View style = {styles.loader}>
        <ActivityIndicator size={props.size || "large"} color={props.color} />
    </View>
  )
}

export default Loader

const styles = StyleSheet.create({
    loader: {
        flex:1,
        justifyContent:"center",
        alignItems:"center"
    }
})