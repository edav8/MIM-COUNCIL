export type IdeaCategory = 'Academic' | 'Careers' | 'Community' | 'Wellbeing' | 'From the cohort';
export type BoardIdea = { id: string; title: string; category: IdeaCategory; description: string; detail: string; progress: string; nextStep: string; question?: string; community?: boolean; featured?: boolean };
export const catalog: BoardIdea[] = [
  {
    "id": "peer-tutor-network",
    "category": "Academic",
    "title": "MIM2MIM Tutoring",
    "description": "Connect classmates who want subject support with MIM students willing to tutor.",
    "detail": "Collect the subjects students need help with and match them with classmates who can explain them, alongside the academic representatives.",
    "progress": "The peer-support format is part of our academic plan. We will invite tutors and gather subject requests before making matches.",
    "nextStep": "Open a tutor sign-up and a short request form, then agree a practical format with the academic representatives.",
    "question": "Which subject could you help with, or use help in?"
  },
  {
    "id": "teaching-feedback",
    "category": "Academic",
    "title": "Class Representatives to collect Feedback",
    "description": "Give each class a clear way to raise concerns about teaching, readings and workload.",
    "detail": "Class representatives collect feedback, identify recurring themes and bring a clear account to lecturers. The council helps coordinate and follows up on responses.",
    "progress": "We have discussed this approach with lecturers, who welcomed the idea.",
    "nextStep": "Agree how each class collects feedback and how the representatives report back on the response."
  },
  {
    "id": "accounting-clinics",
    "category": "Academic",
    "title": "Pre-exam practice sessions",
    "description": "Work through difficult topics and practice questions together before exams.",
    "detail": "Use the cohort’s questions to set the agenda for focused sessions led by classmates comfortable with the material.",
    "progress": "We have already spoken with students who feel comfortable leading practice sessions.",
    "nextStep": "Choose the subjects and topics with academic representatives, then confirm facilitators and times before each exam.",
    "question": "Which subject or topic should the first session cover?"
  },
  {
    "id": "founders-meetups",
    "category": "Careers",
    "title": "Entrepreneurship Community",
    "description": "Connect founders and aspiring founders in collaboration with the Entrepreneurship Club.",
    "detail": "Build a MIM entrepreneurship community in collaboration with the Entrepreneurship Club, where students can exchange ideas, find complementary skills and support each other’s projects.",
    "progress": "Our starting plan is an interest sign-up followed by an informal first meetup.",
    "nextStep": "Gather interests and project ideas, then plan a first meetup with interested students and the Entrepreneurship Club.",
    "question": "What are you building or hoping to explore, and what skills or collaborators would help you take the next step?"
  },
  {
    "id": "regional-career-panels",
    "category": "Careers",
    "title": "Regional career panels",
    "description": "Hear practical perspectives on building a career in the regions our cohort wants to explore.",
    "detail": "Organise focused panels around student demand, with speakers who can discuss local recruitment, working life and routes into their region.",
    "progress": "We have spoken with MIM and MBA students whose regional contacts are willing to take part in career panels.",
    "nextStep": "Survey priority regions, confirm the speakers and arrange an in-person or online panel.",
    "question": "Which region should we focus on first?"
  },
  {
    "id": "recent-graduate-qa",
    "category": "Careers",
    "title": "Recent graduate Q&As",
    "description": "Ask recent business-school graduates about recruitment, career choices and the transition into work.",
    "detail": "Host small Q&A sessions shaped around the cohort’s questions, with time for practical advice and candid discussion.",
    "progress": "We have spoken with graduates from LBS, HEC, LSE, Harvard Business School and Stanford Graduate School of Business who are willing to take part.",
    "nextStep": "Match the first guests to the cohort’s interests, collect questions and confirm dates.",
    "question": "What is one question that you have on your mind for a recent graduate?"
  },
  {
    "id": "mba-mim-families",
    "category": "Community",
    "title": "MIMBA Families",
    "description": "Small groups that connect MIM students with MBA mentors.",
    "detail": "Match MIMs and MBAs around shared interests and make space for regular, informal conversations about studies, careers and life at INSEAD.",
    "progress": "We have spoken with MBA students who are willing to become mentors.",
    "nextStep": "Gather mentor and MIM sign-ups, agree group sizes and arrange the first family meetups.",
    "question": "What would you most want from your MIMBA family: career advice, shared interests or regular social meetups?"
  },
  {
    "id": "post-exam-on-campus",
    "category": "Community",
    "title": "Post-Exam Parties",
    "description": "Bring the cohort together at a local club in Fontainebleau after exams.",
    "detail": "Plan a party around the exam calendar, with clear information about the venue, timing and cost.",
    "progress": "We have spoken with the owner of a local club in Fontainebleau, who is willing to host the party.",
    "nextStep": "Agree a date, capacity and pricing with the venue, then share the details with the cohort."
  },
  {
    "id": "black-tie-tradition",
    "category": "Community",
    "title": "Black-Tie Evenings",
    "description": "Formal evenings inspired by the black-tie event during intro week.",
    "detail": "Bring the cohort together for a dressed-up evening at the university building used for our intro-week black-tie event.",
    "progress": "We have identified the same university venue as an available option for hosting these evenings.",
    "nextStep": "Coordinate the booking, format and budget, and choose a date around the academic calendar.",
    "question": "How often would you like us to organise a black-tie evening?"
  },
  {
    "id": "sports-mixers",
    "category": "Wellbeing",
    "title": "Sports Session",
    "description": "Make time for a shared sports session at local facilities.",
    "detail": "Let student interest guide the sport and format, with clear information about equipment, cost and how to join.",
    "progress": "We have spoken with local sporting courts that are willing to host a session.",
    "nextStep": "Choose the sport, confirm court availability and costs, and open sign-ups.",
    "question": "Which sport would you like us to organise first?"
  },
  {
    "id": "movie-night",
    "category": "Wellbeing",
    "title": "Movie Night",
    "description": "A shared film and an easy evening together on campus.",
    "detail": "Reserve a campus room and let the cohort help choose the film and timing.",
    "progress": "We have spoken with INSEAD, which is willing to reserve a room for us.",
    "nextStep": "Confirm the room, screening arrangements and date, then put the film choice to the cohort.",
    "question": "What would you like to watch?"
  },
  {
    "id": "puppy-yoga",
    "category": "Wellbeing",
    "title": "Puppy yoga/animal visit",
    "description": "Spend time with animals on campus, through puppy yoga or an animal visit.",
    "detail": "Choose a suitable format with the shelters and campus team, with animal welfare, supervision and participants’ needs shaping the session.",
    "progress": "We have spoken with animal shelters that are willing to bring animals to campus.",
    "nextStep": "Agree the format with the shelter and coordinate campus arrangements, timing and supervision.",
    "question": "What would you prefer? Puppy yoga or animal visit?"
  }
];
export const categories: IdeaCategory[] = ['Academic', 'Careers', 'Community', 'Wellbeing', 'From the cohort'];
