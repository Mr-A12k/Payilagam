# 📖 Beginner's Guide to Swagger UI

Welcome! This guide will explain what **Swagger UI** is, why we use it, and how you can add new API endpoints to it so that anyone can test them directly from the browser.

---

## 🚀 What is Swagger UI?
Swagger UI is a magical webpage that automatically reads our backend code and creates a beautiful, interactive interface. 

Instead of using external tools like Postman or Insomnia to test APIs, you can just open a browser, click a button, and test your backend code instantly! 

**Where to find it?**
When your backend server is running, just go to:
👉 **[http://localhost:5000/api-docs](http://localhost:5000/api-docs)**

---

## 🛠️ How it Works
Swagger doesn't automatically know what your APIs do. It relies on special **JSDoc comments** that we write above our routes. Swagger scans these comments and turns them into the interactive UI.

These comments always start with `/**` and include the `@swagger` tag.

---

## 📝 How to Add a New API to Swagger

Whenever you create a new route in a `.routes.js` file, you should write a Swagger block directly above it.

### Step 1: The Basic Block
Here is a template you can copy and paste above your route:

```javascript
/**
 * @swagger
 * /api/your-route-path:
 *   get:
 *     summary: A short description of what this API does
 *     tags: [YourCategoryName]
 *     responses:
 *       200:
 *         description: Success message
 */
router.get("/your-route-path", yourControllerFunction);
```

### Step 2: Adding Request Data (For POST/PUT requests)
If your API requires a user to send data (like a JSON body), you need to define that in the `requestBody` section.

```javascript
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully created!
 */
router.post("/register", registerFunction);
```

### Step 3: Protecting Routes (Auth)
If your API requires a user to be logged in (they need a token), you just add the `security` property:

```javascript
/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []     <-- This adds the Padlock icon!
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/profile", authenticate, getProfile);
```

---

## 🎮 How to Test an API in the Browser

1. Open **[http://localhost:5000/api-docs](http://localhost:5000/api-docs)**
2. Find the API endpoint you want to test and click on it to expand it.
3. Click the **"Try it out"** button on the right side.
4. If it's a `POST` or `PUT` request, type your JSON data into the text box.
5. Click the big blue **"Execute"** button.
6. Scroll down slightly to see the **Server Response**!

### 🔒 Testing Protected Routes (Login required)
If you see a 🔒 padlock icon next to an API, it means you must be logged in to test it.
1. First, use the `/api/auth/login` endpoint to log in.
2. Copy the `token` from the server response.
3. Scroll to the very top of the Swagger page and click the green **"Authorize"** button.
4. Paste your token into the box and click Authorize.
5. You can now test any protected route!

---
*Happy Coding!* 🎉
