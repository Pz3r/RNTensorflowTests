import React, { useState, useEffect } from 'react';
import { Platform, StyleSheet, Text, View, Dimensions } from 'react-native';
import GestureRecognizer, { swipeDirections } from 'react-native-swipe-gestures';

import { Camera } from 'expo-camera';

import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as mobilenet from '@tensorflow-models/mobilenet';
import { cameraWithTensors, bundleResourceIO } from '@tensorflow/tfjs-react-native';

const localModel = require('../../assets/models/imagenet_mobilenet_v1_025_224_classification_1_default_1/model.json');
const localWeigths = require('../../assets/models/imagenet_mobilenet_v1_025_224_classification_1_default_1/group1-shard1of1.bin');

export default function LiveClassificationScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(false);
  const [model, setModel] = useState(null);
  const [tfReady, setTfReady] = useState(false);
  const [predictionFound, setPredictionFound] = useState(false);
  const [userAction, setUserAction] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);

  const TensorCamera = cameraWithTensors(Camera)

  const textureDims = Platform.OS === 'ios' ? { width: 1080, height: 1920 } : { width: 1600, height: 1200 };
  const tensorDims = { width: 224, height: 224 };

  let requestAnimationFrameId = 0;

  useEffect(() => {
    if (!tfReady) {
      (async () => {
        const { status } = await Camera.requestPermissionsAsync();
        console.log(`Camera permission status: ${status}`)
        setHasPermission(status === 'granted');

        await tf.ready();
        setModel(await loadModel());

        setTfReady(true)

      })()
    }
  }, []);

  useEffect(() => {
    if (predictionResult) {
      navigation.replace('ResultScreen', { prediction: predictionResult });
    }
  }, [predictionResult]);

  const loadModel = async () => {
    //const model = await cocoSsd.load();
    const model = await mobilenet.load({version: 1, alpha: .50});
    //const model = await tf.loadGraphModel(bundleResourceIO(localModel, localWeigths));
    return model;
  }

  const getPrediction = async (tensor) => {
    if (!tensor) return;
    //const predictions = await model.predict(tf.cast(tf.expandDims(tensor), 'float32'));
    const predictions = await model.classify(tensor);
    //const predictions = await model.detect(tensor);
    console.log(`===== PREDICTIONS =====`);
    console.log(predictions);
    if (predictions.length > 0) {
      const prediction = predictions[0];
      if (prediction.probability > 0.5) {
        setPredictionFound(predictions);
        setPredictionResult(prediction);
      }
    }
  }

  const handleCameraStream = (imageAsTensors) => {
    console.log(`handling camera stream`);
    const loop = async () => {
      if (!userAction) {
        const nextImageTensor = await imageAsTensors.next().value;
        getPrediction(nextImageTensor);
        requestAnimationFrameId = requestAnimationFrame(loop);
      }
    };
    if (!predictionFound) {
      loop();
    }
  }

  const renderCameraView = () => {
    return (
      <View style={styles.cameraView}>
        <TensorCamera
          style={styles.camera}
          type={Camera.Constants.Type.back}
          zoom={0}
          cameraTextureHeight={textureDims.height}
          cameraTextureWidth={textureDims.width}
          resizeHeight={tensorDims.height}
          resizeWidth={tensorDims.width}
          resizeDepth={3}
          onReady={(imageAsTensors) => handleCameraStream(imageAsTensors)}
          autorender={true}
        />
      </View>
    )
  }

  const onSwipeUp = () => {
    setUserAction(swipeDirections.SWIPE_UP);
  }

  return (
    <View style={styles.container}>
      <GestureRecognizer style={styles.body}
        onSwipeUp={(state) => onSwipeUp(state)}>
        {tfReady && renderCameraView()}
      </GestureRecognizer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8E8E8',
  },
  body: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  cameraView: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    zIndex: -1
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  predictionContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#E8E8E877'
  }
});
