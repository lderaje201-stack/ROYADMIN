import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add testimonials state
state_search = "  const [activities, setActivities] = useState<ActivityItem[]>([]);"
state_replacement = state_search + "\n  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);"
content = content.replace(state_search, state_replacement)

# Import getAllTestimonials
import_search = "import { getAllActivities, createActivity } from './services/AnalyticsService';"
import_replacement = import_search + "\nimport { getAllTestimonials } from './services/TestimonialService';"
content = content.replace(import_search, import_replacement)

# Initial fetch
fetch_search = "        getAllActivities().then(setActivities);"
fetch_replacement = fetch_search + "\n        getAllTestimonials().then(setTestimonials);"
content = content.replace(fetch_search, fetch_replacement, 1)

# Pass to TestimonialsPage
page_search = "              <TestimonialsPage\n                searchQuery={searchQuery}\n                onToast={(type, msg) => addToast(type, msg)}\n              />"
page_replacement = "              <TestimonialsPage\n                testimonials={testimonials}\n                setTestimonials={setTestimonials}\n                searchQuery={searchQuery}\n                onToast={(type, msg) => addToast(type, msg)}\n              />"
content = content.replace(page_search, page_replacement)

# Realtime listener update
realtime_search = """      } else if (table === 'testimonials') {
        getAllActivities().then(setActivities);"""
realtime_replacement = """      } else if (table === 'testimonials') {
        getAllTestimonials().then(setTestimonials);
        getAllActivities().then(setActivities);"""
content = content.replace(realtime_search, realtime_replacement)

with open('src/App.tsx', 'w') as f:
    f.write(content)
