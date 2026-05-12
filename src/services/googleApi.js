import { gapi } from 'gapi-script';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

// Scopes for Google Drive (create/edit files created by the app) and Calendar
const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/calendar.events';
const DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
  'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'
];

export const initGoogleClient = (onInitComplete) => {
  if (!CLIENT_ID || CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
    console.warn("Google API Client ID is missing. Google features will be disabled.");
    if (onInitComplete) onInitComplete(false);
    return;
  }

  gapi.load('client:auth2', () => {
    gapi.client.init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES,
    }).then(() => {
      if (onInitComplete) onInitComplete(true);
    }).catch(error => {
      console.error('Error initializing Google API client', error);
      if (onInitComplete) onInitComplete(false);
    });
  });
};

export const signInGoogle = async () => {
  if (!gapi.auth2) return null;
  const GoogleAuth = gapi.auth2.getAuthInstance();
  if (!GoogleAuth.isSignedIn.get()) {
    await GoogleAuth.signIn();
  }
  return GoogleAuth.currentUser.get();
};

export const signOutGoogle = () => {
  if (!gapi.auth2) return;
  const GoogleAuth = gapi.auth2.getAuthInstance();
  GoogleAuth.signOut();
};

export const getGoogleAuthStatus = () => {
  if (!gapi.auth2) return false;
  return gapi.auth2.getAuthInstance().isSignedIn.get();
};

export const uploadToDrive = async (file, fileName, parents = []) => {
  if (!getGoogleAuthStatus()) throw new Error("Not signed in to Google.");

  const metadata = {
    name: fileName || file.name,
    parents: parents, // Optional Folder ID
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file);

  const accessToken = gapi.auth.getToken().access_token;
  
  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
    body: form,
  });
  
  return response.json(); // Returns { id, name, mimeType }
};

export const downloadFromDriveAsBlobUrl = async (fileId) => {
  if (!getGoogleAuthStatus()) throw new Error("Not signed in to Google.");
  
  const accessToken = gapi.auth.getToken().access_token;
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: new Headers({ 'Authorization': 'Bearer ' + accessToken })
  });
  
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};
