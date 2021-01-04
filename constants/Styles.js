import { StyleSheet } from 'react-native';

import Colors from './Colors';

export default StyleSheet.create({
  registrationInput: {
    marginBottom: 40,
    marginTop: 40,
  },

  registrationHeader: {
    textAlign: 'center',
    fontSize: 20,
    marginBottom: 20,
    marginLeft: 20,
    marginTop: 20,
  },

  registrationLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textColor,
  },

  registrationTextInput: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
    height: 36,
  },

  registrationTextHelper: {
    fontSize: 12,
    fontWeight: '400',
    marginLeft: 20,
    marginRight: 20,
    color: Colors.grey,
    paddingTop: 10,
  },

  registrationDateTextInput: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
    lineHeight: 36,
  },

  registrationPickerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
    height: 36,
  },

  registrationTextInputContainer: {
    borderBottomWidth: 0.25,
    borderBottomColor: Colors.grey,
    marginBottom: 1,
  },

  registrationButtonContainer: {
    justifyContent: 'center',
    flexGrow: 1,
    flexShrink: 0,
    flexBasis: '100%',
    flexDirection: 'row',
    width: '100%',
    marginBottom: 40,
    marginTop: 20,
  },

  registrationCheckBoxes: {
    marginBottom: 20,
    marginLeft: 20,
  },

  registrationDateContainer: {
    borderBottomWidth: 0.25,
    borderBottomColor: Colors.grey,
    marginLeft: 20,
    marginTop: 20,
    marginRight: 20,
    marginBottom: 1,
  },

  registrationDateInput: {
    borderWidth: 0,
    alignItems: 'flex-start',
    justifyContent: 'center',
    height: 36,
    width: '100%',
  },

  buttonSubmit: {
    width: 150,
    backgroundColor: Colors.lightGreen,
    borderColor: Colors.green,
    borderWidth: 2,
    borderRadius: 5,
  },

  buttonCancel: {
    width: 150,
    backgroundColor: Colors.lightGrey,
    borderColor: Colors.grey,
    borderWidth: 2,
    borderRadius: 5,
  },
});
