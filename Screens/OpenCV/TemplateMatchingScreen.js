import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, NativeModules, Platform } from 'react-native';
import GestureRecognizer from 'react-native-swipe-gestures';

import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';

const { CocoVisionModule } = NativeModules;

export default function TemplateMatchingScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [predictions, setPredictions] = useState(null);

  useEffect(() => {
    if (!hasPermission) {
      (async () => {
        const { status } = await Camera.requestPermissionsAsync();
        console.log(`Camera permission status: ${status}`);
        setHasPermission(status === 'granted');
      })();
    }
  }, []);

  const snap = async () => {
    console.log(`Swiping detected!`);
    if (cameraReady) {
      const photo = await this.camera.takePictureAsync();
      console.log(`Photo taken with dimensions: ${photo.width} / ${photo.height}`);
      const base64 = await getBase64(photo.uri);
      checkForTemplates(base64).then(matchedTemplates => {
        console.log(`Matched templates: ${matchedTemplates}`)
      }).catch(err => {
        console.log(`Something bad happened: ${err}`)
      })
    }
  }

  const checkForTemplates = (base64) => {
    return new Promise((resolve, reject) => {
      if (Platform.OS === 'android') {
        CocoVisionModule.matchWithTemplates(base64, 'template1,template2', error => {
          console.log(`Native error: ${error}`)
        }, matchedTemplates => {
          console.log(`Native result: ${matchedTemplates}`)
          resolve(matchedTemplates)
        });
      }
    });
  }

  const getBase64 = async (uri) => {
    // Resize image from camera
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { height: 240 } }],
      { base64: true }
    );
    console.log(`getArrayBuffer: image resized to ${result.width} / ${result.height}`);

    return result.base64;
  }

  if (hasPermission === null) {
    return <View />
  }

  if (hasPermission === false) {
    return (
      <View>
        <Text>No access to Camera</Text>
      </View>
    )
  }

  return (
    <View
      style={styles.container}>
      <Camera
        ref={(ref) => {
          this.camera = ref;
        }}
        style={styles.camera}
        type={Camera.Constants.Type.back}
        onCameraReady={() => setCameraReady(true)}>
        <GestureRecognizer
          style={styles.gestureContainer}
          onSwipeUp={() => snap()}>
          <View style={styles.predictionContainer}>
            {predictions === null &&
              <Text>Swipe up to make a prediction</Text>
            }
            {predictions && predictions.length > 0 &&
              <Text>{JSON.stringify(predictions)}</Text>
            }
            {
              predictions && predictions.length <= 0 &&
              <Text>Could not detect object on screen, swipe up for new prediction</Text>
            }
          </View>
        </GestureRecognizer>
      </Camera>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  gestureContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ff000000',
    flex: 1,
    justifyContent: 'flex-end'
  },
  predictionContainer: {
    width: '100%',
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff77'
  },
  camera: {
    width: '100%',
    height: '100%'
  }
})