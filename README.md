
# react-native-react-native-camera

## Getting started

`$ npm install react-native-react-native-camera --save`

### Mostly automatic installation

`$ react-native link react-native-react-native-camera`

### Manual installation


#### iOS

1. In XCode, in the project navigator, right click `Libraries` ➜ `Add Files to [your project's name]`
2. Go to `node_modules` ➜ `react-native-react-native-camera` and add `RNReactNativeCamera.xcodeproj`
3. In XCode, in the project navigator, select your project. Add `libRNReactNativeCamera.a` to your project's `Build Phases` ➜ `Link Binary With Libraries`
4. Run your project (`Cmd+R`)<

#### Android

1. Open up `android/app/src/main/java/[...]/MainActivity.java`
  - Add `import com.reactlibrary.RNReactNativeCameraPackage;` to the imports at the top of the file
  - Add `new RNReactNativeCameraPackage()` to the list returned by the `getPackages()` method
2. Append the following lines to `android/settings.gradle`:
  	```
  	include ':react-native-react-native-camera'
  	project(':react-native-react-native-camera').projectDir = new File(rootProject.projectDir, 	'../node_modules/react-native-react-native-camera/android')
  	```
3. Insert the following lines inside the dependencies block in `android/app/build.gradle`:
  	```
      compile project(':react-native-react-native-camera')
  	```

#### Windows
[Read it! :D](https://github.com/ReactWindows/react-native)

1. In Visual Studio add the `RNReactNativeCamera.sln` in `node_modules/react-native-react-native-camera/windows/RNReactNativeCamera.sln` folder to their solution, reference from their app.
2. Open up your `MainPage.cs` app
  - Add `using Cl.Json.RNReactNativeCamera;` to the usings at the top of the file
  - Add `new RNReactNativeCameraPackage()` to the `List<IReactPackage>` returned by the `Packages` method


## Usage
```javascript
import RNReactNativeCamera from 'react-native-react-native-camera';

// TODO: What do with the module?
RNReactNativeCamera;
```
  