# which.dev

## Overview

This repository contains two Cloudflare Workers: `profile` and `which-front`. 

The `profile` service handles creating, updating, deleting, and retrieving user profiles stored in Cloudflare KV. 

The `which-front` service displays these profiles in different themes based on user preference.

### Services

1. `profile`
2. `which-front`

## 1. `profile`

The `profile` service provides endpoints to manage user profiles. Profiles are stored in a Cloudflare KV namespace.

### Endpoints

- **Create Profile**: Create a new profile.
  - **Path**: `/profile/create`
  - **Method**: `POST`
  - **Body**:
    ```json
    {
      "profile_id": "rob", // Optional
      "firstName": "Robert",
      "lastName": "Weeden",
      "jobTitle": "Software engineer, Gamer, Dog Dad",
      "company": "4-cube.io",
      "aboutMe": "I'm a software engineer from Madison, WI working at the forefront of web app development. I enjoy building big projects from small pieces and working with others to create amazing technologies.",
      "email": "rob@4-cube.io",
      "githubUrl": "https://github.com/weedenrj",
      "gitlabUrl": "https://gitlab.com/rob286",
      "theme": "fallout"
    }
    ```

- **Update Profile**: Update an existing profile.
  - **Path**: `/profile/update/{profile_id}`
  - **Method**: `PUT`
  - **Body**:
    ```json
    {
      "jobTitle": "Senior Software Engineer",
      "company": "Tech Innovations Inc."
    }
    ```

- **Delete Profile**: Delete a profile.
  - **Path**: `/profile/delete/{profile_id}`
  - **Method**: `DELETE`

- **Get Profile**: Retrieve a profile.
  - **Path**: `/profile/get/{profile_id}`
  - **Method**: `GET`

- **Validate Key**: Validate if a profile ID is available.
  - **Path**: `/profile/validate/{profile_id}`
  - **Method**: `GET`

### Example Curl Commands

#### Create Profile

```sh
curl -X POST "https://profile.webriot.workers.dev/profile/create" \
     -H "Content-Type: application/json" \
     -d '{
            "profile_id": "rob",
            "firstName": "Robert",
            "lastName": "Weeden",
            "jobTitle": "Software engineer, Gamer, Dog Dad",
            "company": "4-cube.io",
            "aboutMe": "I'\''m a software engineer from Madison, WI working at the forefront of web app development. I enjoy building big projects from small pieces and working with others to create amazing technologies.",
            "email": "rob@4-cube.io",
            "githubUrl": "https://github.com/weedenrj",
            "gitlabUrl": "https://gitlab.com/rob286",
            "theme": "fallout"
        }'
```

#### Update Porfile
```sh
curl -X PUT "https://profile.webriot.workers.dev/profile/update/rob" \
     -H "Content-Type: application/json" \
     -d '{
            "jobTitle": "Senior Software Engineer",
            "company": "Tech Innovations Inc."
        }'
```


#### Delete Profile
```sh
curl -X DELETE "https://profile.webriot.workers.dev/profile/delete/rob"
```

#### Get Profile
```sh
curl -X GET "https://profile.webriot.workers.dev/profile/get/rob"
```

#### Validate Key
```sh
curl -X GET "https://profile.webriot.workers.dev/profile/validate/rob"
```


### KV Structure
Profiles are stored in the KV namespace with the following structure:

```json
{
    "profile_id": "rob",
    "firstName": "Robert",
    "lastName": "Weeden",
    "jobTitle": "Software engineer, Gamer, Dog Dad",
    "company": "4-cube.io",
    "aboutMe": "I'm a software engineer from Madison, WI working at the forefront of web app development. I enjoy building big projects from small pieces and working with others to create amazing technologies.",
    "email": "rob@4-cube.io",
    "githubUrl": "https://github.com/weedenrj",
    "gitlabUrl": "https://gitlab.com/rob286",
    "theme": "fallout"
}
```

#### Themes

Profiles can have one of three themes:

-	light: Default theme with white background and black text.
-	dark: Dark theme with black background and white text.
-	fallout: A theme inspired by the Fallout Pip-Boy screen with green text on a black background.


## 2. `which-front`

The which-front service displays user profiles based on their profile_id. The profile is fetched from the KV store and rendered in HTML with the specified theme.

#### URL Pattern

Profiles can be accessed via URLs in the following format:

```
https://which-front.webriot.workers.dev/@profile_id
```

Example:

```
https://which-front.webriot.workers.dev/@rob
```

#### Theme Display

-	light: White background, black text, blue links.
-	dark: Black background, white text, purple links.
-	fallout: Black background, green text, green links, Courier New font, uppercase text.


#### Profile Page Template
```html

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{firstName} {lastName}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: {backgroundColor}; color: {textColor}; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { font-size: 2em; }
        p { line-height: 1.6; }
        a { color: {linkColor}; text-decoration: none; }
        {customStyles}
    </style>
</head>
<body>
    <div class="container">
        <h1>{firstName} {lastName}</h1>
        <p><strong>Job Title:</strong> {jobTitle}</p>
        <p><strong>Company:</strong> {company}</p>
        <p><strong>About Me:</strong> {aboutMe}</p>
        <p><strong>Email:</strong> <a href="mailto:{email}">{email}</a></p>
        <p><strong>GitHub:</strong> <a href="{githubUrl}" target="_blank">{githubUrl}</a></p>
        <p><strong>GitLab:</strong> <a href="{gitlabUrl}" target="_blank">{gitlabUrl}</a></p>
    </div>
</body>
</html>
```
