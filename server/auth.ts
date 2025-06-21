import type { Express, Request, Response, NextFunction } from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import expressSession from "express-session";

interface IUser {
  id: number;
  email: string;
  passwordHash: string;
  name: string;
}

// Hardcoded user for demo
const users = [
  {
    id: 1,
    email: "admin@gmail.com",
    passwordHash: bcrypt.hashSync("admin123", 10),
    name: "Admin User"
  }
];

passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    (email, password, done) => {
      const user = users.find((u) => u.email === email);
      if (!user) return done(null, false, { message: "Incorrect email." });
      if (!bcrypt.compareSync(password, user.passwordHash)) {
        return done(null, false, { message: "Incorrect password." });
      }
      return done(null, user);
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});
passport.deserializeUser((id: number, done) => {
  const user = users.find((u) => u.id === id);
  done(null, user || false);
});

export function setupAuth(app: Express) {
  app.use(expressSession({
    secret: "supersecret",
    resave: false,
    saveUninitialized: false,
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  // Email login endpoint
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: Express.User | false, info: { message: string },) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info.message });
      req.logIn(user, (err: any) => {
        if (err) return next(err);
        res.json({ user: { email: (user as IUser).email, name: (user as IUser).name } });
      });
    })(req, res, next);
  });

  // Logout
  app.post("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect("/login");
    });
  });

  // Authenticated user endpoint
  app.get("/api/auth/user", (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = req.user as { email: string; name: string };
    res.json({ email: user.email, name: user.name });
  });
}

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user) return next();
  res.status(401).json({ message: "Unauthorized" });
}
