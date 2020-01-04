// /**
//  * Sample React Native App
//  * https://github.com/facebook/react-native
//  *
//  * @format
//  * @flow
//  */

// import React from 'react';
// import {
//   SafeAreaView,
//   StyleSheet,
//   ScrollView,
//   View,
//   Text,
//   StatusBar,
// } from 'react-native';

// import {
//   Header,
//   LearnMoreLinks,
//   Colors,
//   DebugInstructions,
//   ReloadInstructions,
// } from 'react-native/Libraries/NewAppScreen';

// const App: () => React$Node = () => {
//   return (
//     <>
//       <StatusBar barStyle="dark-content" />
//       <SafeAreaView>
//         <ScrollView
//           contentInsetAdjustmentBehavior="automatic"
//           style={styles.scrollView}>
//           <Header />
//           {global.HermesInternal == null ? null : (
//             <View style={styles.engine}>
//               <Text style={styles.footer}>Engine: Hermes</Text>
//             </View>
//           )}
//           <View style={styles.body}>
//             <View style={styles.sectionContainer}>
//               <Text style={styles.sectionTitle}>Step One</Text>
//               <Text style={styles.sectionDescription}>
//                 Edit <Text style={styles.highlight}>App.js</Text> to change this
//                 screen and then come back to see your edits.
//               </Text>
//             </View>
//             <View style={styles.sectionContainer}>
//               <Text style={styles.sectionTitle}>See Your Changes</Text>
//               <Text style={styles.sectionDescription}>
//                 <ReloadInstructions />
//               </Text>
//             </View>
//             <View style={styles.sectionContainer}>
//               <Text style={styles.sectionTitle}>Debug</Text>
//               <Text style={styles.sectionDescription}>
//                 <DebugInstructions />
//               </Text>
//             </View>
//             <View style={styles.sectionContainer}>
//               <Text style={styles.sectionTitle}>Learn More</Text>
//               <Text style={styles.sectionDescription}>
//                 Read the docs to discover what to do next:
//               </Text>
//             </View>
//             <LearnMoreLinks />
//           </View>
//         </ScrollView>
//       </SafeAreaView>
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   scrollView: {
//     backgroundColor: Colors.lighter,
//   },
//   engine: {
//     position: 'absolute',
//     right: 0,
//   },
//   body: {
//     backgroundColor: Colors.white,
//   },
//   sectionContainer: {
//     marginTop: 32,
//     paddingHorizontal: 24,
//   },
//   sectionTitle: {
//     fontSize: 24,
//     fontWeight: '600',
//     color: Colors.black,
//   },
//   sectionDescription: {
//     marginTop: 8,
//     fontSize: 18,
//     fontWeight: '400',
//     color: Colors.dark,
//   },
//   highlight: {
//     fontWeight: '700',
//   },
//   footer: {
//     color: Colors.dark,
//     fontSize: 12,
//     fontWeight: '600',
//     padding: 4,
//     paddingRight: 12,
//     textAlign: 'right',
//   },
// });

// export default App;


import React, { Component } from 'react';
import init from 'react_native_mqtt';
import {
  AsyncStorage,
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  Alert
} from 'react-native';

init({
  size: 10000,
  storageBackend: AsyncStorage,
  defaultExpires: 1000 * 3600 * 24,
  enableCache: true,
  sync: {},
});


export default class App extends Component {

  constructor() {
    super();
    this.onMessageArrived = this.onMessageArrived.bind(this)
    this.onConnectionLost = this.onConnectionLost.bind(this)


    const client = new Paho.MQTT.Client('67.205.172.206', 9001, 'clientid');
    client.onMessageArrived = this.onMessageArrived;
    client.onConnectionLost = this.onConnectionLost;
    client.connect({
      onSuccess: this.onConnect,
      //useSSL: false,
      //userName: '',
      //password: '',
      onFailure: (e) => { console.log("here is the error", e); }
    });

    this.state = {
      message: [''],
      client,
      messageToSend: '',
      isConnected: false,
    };
  }

  onMessageArrived(entry) {
    console.log("onMessageArrived:" + message.payloadString);
    this.setState({ message: [...this.state.message, entry.payloadString] });
  }

  onConnect = () => {
    const { client } = this.state;
    console.log("Connected!!!!");
    client.subscribe('abc/def');
    this.setState({ isConnected: true, error: '' })
  };

  sendMessage() {
    message = new Paho.MQTT.Message(this.state.messageToSend);
    message.destinationName = "iot/puerta";

    if (this.state.isConnected) {
      this.state.client.send(message);
    } else {
      client.connect(this.state.client)
        .then(() => {
          this.state.client.send(message);
          this.setState({ error: '', isConnected: true });
        })
        .catch((error) => {
          console.log(error);
          this.setState({ error: error });
        });
    }
  }

  onConnectionLost(responseObject) {
    console.log(responseObject);
    if (responseObject.errorCode !== 0) {
      console.log("onConnectionLost:" + responseObject.errorMessage);
      this.setState({ error: 'Lost Connection', isConnected: false });
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to React Native MQTT!
        </Text>
        <Text style={styles.instructions}>
          Message: {this.state.message.join(' --- ')}
        </Text>
        <Text style={{ color: 'red' }}>
          {this.state.error}
        </Text>
        {this.state.isConnected ?
          <Text style={{ color: 'green' }}>
            Connected
            </Text> : null
        }
        <TextInput
          value={this.state.messageToSend}
          onChangeText={(value => this.setState({ messageToSend: value }))}
          placeholder="Type hereee..."
          style={styles.input} />
        <Button onPress={this.sendMessage.bind(this)} title="Send Message" />

      </View>
    );
  }


}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  button: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {
    color: 'blue',
  },
  input: {
    width: 300
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});