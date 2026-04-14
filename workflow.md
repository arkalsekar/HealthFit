# HealthFit — System Workflow

## 1. System Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  React SPA  │────▶│  Supabase    │────▶│  PostgreSQL DB  │
│  (Vite)     │     │  Auth + API  │     │  (profiles,     │
└──────┬──────┘     └──────────────┘     │   meals, logs)  │
       │                                  └─────────────────┘
       │            ┌──────────────┐
       └───────────▶│  Edge Func   │────▶ Lovable AI Gateway (Gemini)
                    │  ai-recommend│
                    └──────────────┘
```

## 2. User Flow

1. **Landing** → Sign Up / Login
2. **Profile Setup** → Enter health data, preferences, goals
3. **Dashboard** → View daily nutrition summary, BMI, BMR, charts
4. **Log Meal** → Manual entry with calories & macros
5. **AI Recommend** → Set context → Get AI-powered meal suggestion → Log it

## 3. Data Flow

- Auth: Supabase Auth (email/password) → JWT session → RLS-protected queries
- Profile: User edits → `profiles` table → BMI auto-calculated
- Meals: User logs → `meals` + `user_logs` tables → Dashboard aggregates
- AI: Context engine builds prompt → Edge function calls Gemini → Response parsed & displayed

## 4. Context Awareness Logic

The context engine (`contextEngine.ts`) considers:
- **Time of day**: Auto-detected (breakfast/lunch/dinner/snack/late-night)
- **Location**: home / college / restaurant / office
- **Activity level**: sedentary / moderate / active / very_active
- **Budget**: low / medium / high
- **User profile**: age, weight, height, goals, dietary preference, food preferences, health conditions

## 5. AI Pipeline (Gemini via Lovable AI)

1. Frontend builds structured context from profile + user inputs
2. `buildPrompt()` creates a detailed nutrition-focused prompt
3. Edge function `ai-recommend` sends to Lovable AI Gateway
4. Gemini returns JSON with: meal_name, ingredients, calories, macros, micros, GI, reason
5. Frontend parses and displays; user can log the recommendation

## 6. Nutritional Calculations

### BMI (Body Mass Index)
```
BMI = weight(kg) / height(m)²
```

### BMR (Basal Metabolic Rate — Mifflin-St Jeor)
```
Male:   BMR = 10 × weight(kg) + 6.25 × height(cm) − 5 × age + 5
Female: BMR = 10 × weight(kg) + 6.25 × height(cm) − 5 × age − 161
```

Daily calorie goal = BMR × activity multiplier (default: 1.4)

## 7. Security

- **Authentication**: Supabase Auth with JWT sessions, auto-refresh
- **Row Level Security**: All tables protected — users can only access their own data
- **Edge Functions**: CORS configured, input validation, error handling
- **API Keys**: LOVABLE_API_KEY stored as secret, never exposed to client

## 8. Future Scope

- Barcode/image-based food recognition
- Weekly/monthly progress reports
- Social features (share meals, challenges)
- Wearable device integration
- Multi-language support
- Meal planning & grocery list generation
