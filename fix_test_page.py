import re

with open('src/components/pages/TestimonialsPage.tsx', 'r') as f:
    content = f.read()

# Update Interface
interface_search = """interface ReviewsPageProps {
  searchQuery: string;
  onToast: (type: 'success' | 'info' | 'warning' | 'error', msg: string) => void;
}"""
interface_replacement = """interface ReviewsPageProps {
  testimonials: Testimonial[];
  setTestimonials: React.Dispatch<React.SetStateAction<Testimonial[]>>;
  searchQuery: string;
  onToast: (type: 'success' | 'info' | 'warning' | 'error', msg: string) => void;
}"""
content = content.replace(interface_search, interface_replacement)

# Update Component Signature
comp_search = "export const TestimonialsPage: React.FC<ReviewsPageProps> = ({ searchQuery, onToast }) => {"
comp_replacement = "export const TestimonialsPage: React.FC<ReviewsPageProps> = ({ testimonials, setTestimonials, searchQuery, onToast }) => {"
content = content.replace(comp_search, comp_replacement)

# Remove local state for testimonials
content = content.replace("  const [testimonials, setReviews] = useState<Testimonial[]>([]);\n", "")

# Remove setReviews entirely, replace with setTestimonials
content = content.replace("setReviews", "setTestimonials")

# Remove loading state for initial fetch (optional, but let's just default to false)
content = content.replace("  const [loading, setLoading] = useState(true);", "  const loading = false;")
content = content.replace("setLoading(true);", "")
content = content.replace("setLoading(false);", "")

with open('src/components/pages/TestimonialsPage.tsx', 'w') as f:
    f.write(content)
