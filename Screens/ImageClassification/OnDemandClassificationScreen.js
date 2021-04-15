import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import GestureRecognizer, { swipeDirections } from 'react-native-swipe-gestures';

import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';

import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

import { decode } from 'base64-arraybuffer';
import jpeg from 'jpeg-js';

export default function OnDemandClassificationScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [predictions, setPredictions] = useState(null);
  const [tfReady, setTfReady] = useState(false);
  const [model, setModel] = useState(null);

  useEffect(() => {
    if (!tfReady) {
      (async () => {
        const { status } = await Camera.requestPermissionsAsync();
        console.log(`Camera permission status: ${status}`);
        setHasPermission(status === 'granted');

        await tf.ready();
        setModel(await loadModel());

        setTfReady(true);
      })();
    }
  }, []);

  const loadModel = async () => {
    const model = await cocoSsd.load();
    return model;
  }

  const snap = async () => {
    console.log(`Swiping detected!`);
    if (cameraReady && model) {
      /*
      const ratios = await this.camera.getSupportedRatiosAsync();
      console.log(`Available picure ratios: ${ratios}`);
      const sizes = await this.camera.getAvailablePictureSizesAsync('4:3');
      console.log(`Available picture sizes: ${sizes}`);
      */

      const photo = await this.camera.takePictureAsync();
      console.log(`Photo taken with dimensions: ${photo.width} / ${photo.height}`);
      const arrayBuffer = await getArrayBufferFromUri(photo.uri);
      console.log(`arrayBuffer obtained`);
      const imageTensor = imageToTensor(arrayBuffer);
      console.log(`tensor obtained from image`);
      const predictions = await model.detect(imageTensor);
      console.log(`predictions obtained: ${JSON.stringify(predictions)}`);
      setPredictions(predictions);
    }
  }

  const getArrayBufferFromUri = async (uri) => {
    // Resize image from camera
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { height: 240 } }],
      { base64: true }
    );
    console.log(`getArrayBuffer: image resized to ${result.width} / ${result.height}`);

    // Decode the base64 from manipulated image
    const arrayBuffer = decode(result.base64);
    console.log(`getArrayBuffer: arrayBuffer decoded from base64`);

    return arrayBuffer;
  }

  const imageToTensor = (rawImageData) => {
    const TO_UINT8ARRAY = true
    const { width, height, data } = jpeg.decode(rawImageData, TO_UINT8ARRAY)
    // Drop the alpha channel info for COCO-SSD
    const buffer = new Uint8Array(width * height * 3)
    let offset = 0 // offset into original data
    for (let i = 0; i < buffer.length; i += 3) {
      buffer[i] = data[offset]
      buffer[i + 1] = data[offset + 1]
      buffer[i + 2] = data[offset + 2]
      offset += 4
    }
    return tf.tensor3d(buffer, [height, width, 3])
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

  if (!model) {
    return (
      <View style={styles.container}>
        <Text>Setting up prediction model please wait...</Text>
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