# Routing

Speed.js uses file-based routing. Routes are automatically discovered from the `src/routes` directory.

## File-based Routes

```
src/routes/
├── index.tsx              -> /
├── about.tsx              -> /about
├── users/
│   ├── index.tsx          -> /users
│   └── [id].tsx           -> /users/:id
└── docs/
    └── [...slug].tsx      -> /docs/:slug*
```

## Static Routes

```tsx
// src/routes/index.tsx
export default function Home() {
  return <h1>Home</h1>;
}
```

## Dynamic Routes

```tsx
// src/routes/users/[id].tsx
export default function User({ id }: { id: string }) {
  return <h1>User {id}</h1>;
}
```

## Catch-all Routes

```tsx
// src/routes/docs/[...slug].tsx
export default function Docs({ slug }: { slug: string }) {
  return <h1>Docs: {slug}</h1>;
}
```

## Nested Routes

```tsx
// src/routes/dashboard/index.tsx
export default function Dashboard() {
  return (
    <div>
      <nav>Dashboard Navigation</nav>
      <main>Dashboard Content</main>
    </div>
  );
}
```

## Loaders

Loaders fetch data before rendering:

```tsx
// src/routes/users/[id].tsx
export async function loader({ params }: LoaderArgs) {
  const user = await fetch(`/api/users/${params.id}`).then(r => r.json());
  return { user };
}

export default function User({ user }: { user: any }) {
  return <h1>{user.name}</h1>;
}
```

## Actions

Actions handle form submissions:

```tsx
// src/routes/users/create.tsx
export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const name = formData.get('name');
  // Create user...
  return redirect('/users');
}

export default function CreateUser() {
  return (
    <form method="post">
      <input name="name" />
      <button type="submit">Create</button>
    </form>
  );
}
```

## Redirects

```tsx
import { redirect } from '@speedjs/router';

export async function loader() {
  if (!isAuthenticated()) {
    return redirect('/login');
  }
  // ...
}
```

## Not Found

```tsx
import { notFound } from '@speedjs/router';

export async function loader({ params }: LoaderArgs) {
  const user = await fetchUser(params.id);
  if (!user) {
    return notFound();
  }
  return { user };
}
```

## Client Navigation

```tsx
import { navigate } from '@speedjs/router';

function Link({ href, children }: { href: string; children: any }) {
  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        navigate(href);
      }}
    >
      {children}
    </a>
  );
}
```

## Route Manifest

The Vite plugin generates a route manifest at build time:

```tsx
import routes from 'virtual:speed/routes';

// routes contains all discovered routes with metadata
```

## Best Practices

- Keep route files focused on their route
- Use loaders for data fetching
- Use actions for mutations
- Handle redirects and not found appropriately
- Use dynamic routes for parameterized paths
- Use catch-all routes for nested content
