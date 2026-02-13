# CFD Component Library - Setup & Usage Guide

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20.x LTS or higher
- **npm** 10.x or higher (comes with Node.js)
- A code editor (VS Code recommended)

## 🚀 Installation Steps

### 1. Install Dependencies

```bash
cd cfd-component-library
npm install
```

This will install all required dependencies:
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Storybook
- Vite
- And more...

### 2. Start Development Server

```bash
npm run dev
```

This starts Vite dev server at http://localhost:5173

### 3. Launch Storybook

```bash
npm run storybook
```

This opens Storybook at http://localhost:6006 where you can:
- Browse all components
- Test components interactively
- View documentation
- Copy code examples

## 📁 Project Structure Explained

```
cfd-component-library/
│
├── .storybook/              # Storybook configuration
│   ├── main.ts             # Storybook setup
│   └── preview.ts          # Global decorators and parameters
│
├── src/                     # Source code
│   ├── components/         # Component library
│   │   ├── Button/
│   │   │   ├── Button.tsx           # Component implementation
│   │   │   └── Button.stories.tsx   # Storybook stories
│   │   ├── Input/
│   │   ├── Card/
│   │   ├── PriceTicker/
│   │   ├── PositionCard/
│   │   └── DashboardLayout/
│   │
│   ├── index.css           # Global styles + Tailwind
│   └── index.ts            # Main export file
│
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build configuration
└── README.md               # Documentation
```

## 🎨 Using Components in Your Project

### Method 1: Direct Import (Recommended for Development)

Copy the component files you need into your project:

```bash
# Copy a specific component
cp -r src/components/Button ../my-project/src/components/

# Or copy the entire library
cp -r src/components ../my-project/src/
```

Then import and use:

```tsx
import { Button } from './components/Button/Button';

function MyComponent() {
  return <Button variant="primary">Click Me</Button>;
}
```

### Method 2: Build as NPM Package

1. Build the library:

```bash
npm run build
```

2. Link locally for testing:

```bash
npm link
cd ../my-project
npm link cfd-component-library
```

3. Import in your project:

```tsx
import { Button, Input, Card } from 'cfd-component-library';
```

### Method 3: Publish to NPM (Production)

```bash
# Login to NPM
npm login

# Publish
npm publish
```

Then install in any project:

```bash
npm install cfd-component-library
```

## 🔧 Development Workflow

### Adding a New Component

1. **Create Component Folder**

```bash
mkdir src/components/MyNewComponent
```

2. **Create Component File**

```tsx
// src/components/MyNewComponent/MyNewComponent.tsx
import React from 'react';
import clsx from 'clsx';

export interface MyNewComponentProps {
  variant?: 'default' | 'special';
  children: React.ReactNode;
  className?: string;
}

export const MyNewComponent: React.FC<MyNewComponentProps> = ({
  variant = 'default',
  children,
  className,
}) => {
  return (
    <div className={clsx(
      'p-4 rounded-lg',
      variant === 'default' && 'bg-gray-100',
      variant === 'special' && 'bg-primary-100',
      className
    )}>
      {children}
    </div>
  );
};
```

3. **Create Storybook Stories**

```tsx
// src/components/MyNewComponent/MyNewComponent.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MyNewComponent } from './MyNewComponent';

const meta = {
  title: 'Components/MyNewComponent',
  component: MyNewComponent,
  tags: ['autodocs'],
} satisfies Meta<typeof MyNewComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Hello World',
  },
};
```

4. **Export from index.ts**

```typescript
// src/index.ts
export { MyNewComponent } from './components/MyNewComponent/MyNewComponent';
export type { MyNewComponentProps } from './components/MyNewComponent/MyNewComponent';
```

5. **Test in Storybook**

```bash
npm run storybook
```

Navigate to "Components/MyNewComponent" to see your component!

## 🎯 Common Use Cases

### Creating a Trading Dashboard

```tsx
import {
  DashboardLayout,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  PriceTicker,
  PositionCard,
  Button,
} from 'cfd-component-library';

function TradingDashboard() {
  const positions = [
    {
      id: '1',
      symbol: 'EUR/USD',
      type: 'BUY',
      size: 1.5,
      entryPrice: 1.0850,
      currentPrice: 1.0875,
      unrealizedPnL: 375,
      margin: 217,
      openedAt: new Date().toISOString(),
    },
  ];

  return (
    <DashboardLayout
      header={{
        logo: 'TradeCFD',
        balance: '$10,245.50',
        balanceChange: '+$245.50',
        user: { name: 'John Doe' },
        notifications: 3,
      }}
      navigation={[
        { label: 'Dashboard', href: '/', active: true },
        { label: 'Markets', href: '/markets' },
        { label: 'Positions', href: '/positions' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Price Tickers */}
        <Card>
          <CardBody>
            <PriceTicker
              symbol="EUR/USD"
              currentPrice={1.0875}
              change={0.0025}
              changePercent={0.23}
              bid={1.0873}
              ask={1.0875}
            />
          </CardBody>
        </Card>

        {/* Open Positions */}
        {positions.map((position) => (
          <PositionCard
            key={position.id}
            position={position}
            onClose={(id) => console.log('Close', id)}
            onModify={(id) => console.log('Modify', id)}
          />
        ))}
      </div>
    </DashboardLayout>
  );
}
```

### Building a Trade Entry Form

```tsx
import { Input, Button } from 'cfd-component-library';
import { useState } from 'react';

function TradeEntryForm() {
  const [formData, setFormData] = useState({
    size: '1.0',
    stopLoss: '',
    takeProfit: '',
  });

  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate and submit
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Position Size (lots)"
        type="number"
        value={formData.size}
        onChange={(e) => setFormData({ ...formData, size: e.target.value })}
        error={errors.size}
        helperText="Minimum 0.01 lots"
        required
      />

      <Input
        label="Stop Loss (optional)"
        type="number"
        value={formData.stopLoss}
        onChange={(e) => setFormData({ ...formData, stopLoss: e.target.value })}
        placeholder="1.0850"
      />

      <Input
        label="Take Profit (optional)"
        type="number"
        value={formData.takeProfit}
        onChange={(e) => setFormData({ ...formData, takeProfit: e.target.value })}
        placeholder="1.0900"
      />

      <div className="flex gap-3">
        <Button variant="success" type="submit" fullWidth>
          BUY
        </Button>
        <Button variant="danger" type="button" fullWidth>
          SELL
        </Button>
      </div>
    </form>
  );
}
```

## 🎨 Customizing the Design System

### Modifying Colors

Edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        500: '#YOUR_COLOR', // Change primary color
      },
      // Add custom colors
      brand: {
        500: '#123456',
      },
    },
  },
}
```

### Changing Fonts

1. Import fonts in `src/index.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=YourFont:wght@400;600;700&display=swap');
```

2. Update `tailwind.config.js`:

```javascript
fontFamily: {
  body: ['YourFont', 'sans-serif'],
},
```

### Adding Custom Animations

In `tailwind.config.js`:

```javascript
animation: {
  'custom-bounce': 'bounce 1s ease-in-out infinite',
},
keyframes: {
  'custom-bounce': {
    '0%, 100%': { transform: 'translateY(0)' },
    '50%': { transform: 'translateY(-10px)' },
  },
},
```

## 🧪 Testing Components

### Visual Testing with Storybook

```bash
npm run storybook
```

- Browse components
- Test different props
- Check responsive behavior
- Verify accessibility

### Unit Testing (Optional Setup)

Install testing dependencies:

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
```

Create test file:

```tsx
// src/components/Button/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });
});
```

## 📦 Building for Production

### Build the Library

```bash
npm run build
```

This creates:
- `dist/cfd-components.es.js` - ES module
- `dist/cfd-components.umd.js` - UMD module
- `dist/style.css` - Compiled styles

### Build Storybook for Deployment

```bash
npm run build-storybook
```

This creates a static site in `storybook-static/` that you can deploy to:
- Netlify
- Vercel
- GitHub Pages
- Any static hosting

## 🐛 Troubleshooting

### Common Issues

**Issue: Tailwind styles not applying**
```bash
# Restart dev server
npm run dev
```

**Issue: TypeScript errors**
```bash
# Regenerate type definitions
npx tsc --noEmit
```

**Issue: Storybook not loading**
```bash
# Clear cache and restart
rm -rf node_modules/.cache
npm run storybook
```

### Getting Help

- Check component stories in Storybook
- Review component props in TypeScript definitions
- Read the main README.md
- Check GitHub issues

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Storybook Docs](https://storybook.js.org/docs)

## 🎓 Learning Path

1. **Week 1: Familiarization**
   - Run Storybook
   - Browse all components
   - Try different props
   - Copy examples

2. **Week 2: Basic Usage**
   - Import components in your project
   - Build simple layouts
   - Customize with Tailwind classes
   - Handle events

3. **Week 3: Advanced**
   - Create new components
   - Customize design system
   - Build complete pages
   - Optimize performance

4. **Week 4: Production**
   - Build for production
   - Deploy Storybook
   - Publish to NPM
   - Document custom components

## ✅ Checklist for New Users

- [ ] Install Node.js 20+
- [ ] Clone/download the repository
- [ ] Run `npm install`
- [ ] Start dev server with `npm run dev`
- [ ] Launch Storybook with `npm run storybook`
- [ ] Browse components in Storybook
- [ ] Try modifying a component
- [ ] Create a test page using components
- [ ] Customize colors in Tailwind config
- [ ] Build your first feature

## 🎉 You're Ready!

You now have a complete component library ready for building professional trading platforms. Start with Storybook to explore components, then integrate them into your project.

Happy coding! 🚀

---

**Questions?** Open an issue on GitHub or check the main README.md for more information.
