# Vetris: Pet Health Management System


[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CS50](https://img.shields.io/badge/CS50-Final%20Project-blue)](https://cs50.harvard.edu/)

## Table of Contents

- [About The Project](#about-the-project)
- [Key Features](#key-features)
- [Built With](#built-with)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Development](#development)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)
- [Acknowledgments](#acknowledgments)

## About The Project

Vetris is a modern, responsive web application developed as a final project for Harvard's CS50 course. It represents a comprehensive solution for pet health management, designed to help pet owners organize, track, and manage all aspects of their beloved companions' health information in one centralized, secure location.

The application addresses a common challenge faced by pet owners worldwide: the fragmentation of pet health data across various sources such as veterinary clinics, physical documents, email records, and different service providers. This scattered approach to health information management can lead to missed vaccinations, forgotten appointments, incomplete medical histories during emergencies, and overall anxiety about whether pets are receiving optimal care.

Vetris transforms this chaotic landscape into an organized, intuitive digital experience. The platform leverages modern web technologies to create a seamless user interface that works flawlessly across all devices, from desktop computers to mobile phones. The application's design philosophy centers around simplicity without sacrificing functionality, ensuring that users of all technical backgrounds can effectively manage their pets' health information.

The project showcases the practical application of full-stack web development principles learned in CS50, demonstrating proficiency in modern JavaScript frameworks, responsive design, API integration, and user experience design. By building on the Base44 platform, the application benefits from enterprise-grade infrastructure while maintaining the flexibility to implement custom features specific to pet health management.

What sets Vetris apart is its holistic approach to pet care. Rather than focusing solely on medical records, the application encompasses the entire spectrum of pet wellness, including preventive care scheduling, medication management, dietary tracking, exercise monitoring, and behavioral observations. This comprehensive approach enables pet owners to maintain a complete picture of their pet's health journey, facilitating better communication with veterinarians and more informed decision-making about their pet's care.

## Key Features

Vetris offers a comprehensive suite of features designed to streamline every aspect of pet health management:

**Comprehensive Pet Profiles:** Create detailed, customizable profiles for each pet, including essential information such as breed, age, weight, microchip details, insurance information, and emergency contacts. Each profile serves as a central hub for all pet-related data, with the ability to upload and store photos that help identify pets and track their physical changes over time.

**Advanced Health Record Management:** Maintain detailed medical histories with chronological tracking of all health events. The system supports various record types including routine check-ups, emergency visits, surgical procedures, diagnostic tests, and specialist consultations. Each record can include detailed notes, attached documents, images, and cost tracking for insurance and budgeting purposes.

**Intelligent Vaccination and Medication Tracking:** Never miss important vaccinations or medication doses with the application's smart reminder system. The platform maintains comprehensive vaccination schedules based on pet type, age, and local regulations, while the medication tracker supports complex dosing schedules, refill reminders, and interaction warnings.

**Appointment Management System:** Streamline veterinary care with integrated appointment scheduling and management. The system tracks upcoming appointments, maintains a history of past visits, and can integrate with popular calendar applications. Appointment records can include pre-visit notes, post-visit summaries, and follow-up reminders.

**Health Analytics and Insights:** Visualize your pet's health trends through interactive charts and graphs. Track weight changes, medication effectiveness, recurring symptoms, and other health metrics over time. The analytics engine can identify patterns and provide insights that help optimize your pet's care routine.

**Multi-Pet Household Support:** Manage multiple pets from a single account with easy switching between pet profiles. The system supports households with different types of pets (dogs, cats, birds, etc.) and can handle complex scenarios such as shared medications or group activities.

**Secure Document Storage:** Upload and organize important documents such as adoption papers, insurance policies, vaccination certificates, and medical reports. The system provides secure cloud storage with easy retrieval and sharing capabilities for veterinary visits or pet care services.

**Emergency Information Access:** Quick access to critical information during emergencies, including allergies, current medications, emergency contacts, and preferred veterinary clinics. This information can be accessed offline and shared instantly with emergency veterinary services.

## Built With

Vetris leverages a modern, robust technology stack that ensures optimal performance, scalability, and user experience:

**Frontend Framework:**
- **React 18.2.0:** The application is built using React, a powerful JavaScript library for building user interfaces. React's component-based architecture enables the creation of reusable UI components and efficient state management, resulting in a responsive and interactive user experience.
- **Vite 6.1.0:** Serving as the build tool and development server, Vite provides lightning-fast hot module replacement and optimized production builds, significantly improving the development experience and application performance.

**Styling and UI Components:**
- **Tailwind CSS 3.4.17:** A utility-first CSS framework that enables rapid UI development with consistent design patterns. Tailwind's approach allows for highly customizable designs while maintaining a small bundle size.
- **Radix UI:** A comprehensive collection of low-level UI primitives that provide accessibility, keyboard navigation, and focus management out of the box. Components include dialogs, dropdowns, tooltips, and form controls that ensure the application meets modern accessibility standards.
- **Framer Motion 12.4.7:** Advanced animation library that brings the interface to life with smooth, performant animations and transitions, enhancing user engagement and providing visual feedback for interactions.

**Form Management and Validation:**
- **React Hook Form 7.54.2:** Efficient form library that minimizes re-renders and provides excellent performance for complex forms. Integrated with Zod for robust schema validation.
- **Zod 3.24.2:** TypeScript-first schema validation library that ensures data integrity and provides excellent developer experience with type inference.

**Data Visualization:**
- **Recharts 2.15.1:** A composable charting library built on React components, used for creating interactive health analytics and trend visualizations.

**Routing and Navigation:**
- **React Router DOM 7.2.0:** Declarative routing for React applications, enabling seamless navigation between different sections of the application.

**Development and Code Quality:**
- **ESLint 9.19.0:** Comprehensive linting tool configured with React-specific rules to maintain code quality and consistency.
- **TypeScript Support:** Full TypeScript configuration for enhanced development experience and type safety.

**Platform Integration:**
- **Base44 SDK 0.1.2:** Custom SDK for seamless integration with the Base44 platform, providing backend services, authentication, and data persistence.

## Getting Started

Follow these steps to set up Vetris for local development:

### Prerequisites

Ensure you have the following software installed on your development machine:

- **Node.js** (version 18.0 or higher)
- **npm** (version 8.0 or higher) or **yarn**
- **Git** for version control

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your_username/vetris.git
   cd vetris
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the root directory and add necessary configuration:
   ```env
   VITE_BASE44_API_URL=your_api_url
   VITE_BASE44_APP_ID=your_app_id
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173/`.

## Usage

Once the application is running, you can:

1. **Create an account** or log in to access the dashboard
2. **Add pet profiles** with detailed information about each of your pets
3. **Record health events** such as vaccinations, check-ups, and treatments
4. **Set up reminders** for upcoming appointments and medication schedules
5. **View analytics** to track your pet's health trends over time
6. **Upload documents** to maintain a complete digital health record

## Project Structure

The application follows a well-organized structure optimized for maintainability and scalability:

```
/vetris
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable React components
│   │   ├── ui/           # Base UI components (buttons, inputs, etc.)
│   │   └── features/     # Feature-specific components
│   ├── pages/            # Page components and routing
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions and helpers
│   ├── lib/              # Third-party library configurations
│   ├── styles/           # Global styles and Tailwind configuration
│   └── main.jsx          # Application entry point
├── package.json          # Project dependencies and scripts
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── README.md            # Project documentation
```

## Development

The project uses modern development practices and tools:

**Development Server:**
```bash
npm run dev          # Start development server with hot reload
```

**Building for Production:**
```bash
npm run build        # Create optimized production build
npm run preview      # Preview production build locally
```

**Code Quality:**
```bash
npm run lint         # Run ESLint for code quality checks
```

## Future Enhancements

The roadmap for Vetris includes several exciting features and improvements:

**Mobile Application:** Development of native iOS and Android applications to provide offline access and push notifications for reminders and alerts.

**Veterinary Integration:** API integrations with veterinary practice management systems to enable seamless data sharing and appointment booking directly through the platform.

**AI-Powered Health Insights:** Implementation of machine learning algorithms to analyze health patterns and provide personalized recommendations for preventive care and early detection of potential health issues.

**Community Features:** Social features that allow pet owners to connect, share experiences, and access a knowledge base of pet care information contributed by the community and veterinary professionals.

**Telemedicine Integration:** Integration with veterinary telemedicine platforms to enable remote consultations and health monitoring directly through the Vetris interface.

## Contributing

We welcome contributions from the community! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure your code follows the project's coding standards and includes appropriate tests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Project Link: [https://github.com/your_username/vetris](https://github.com/your_username/vetris)

For support and questions, please contact: [your.email@example.com](mailto:your.email@example.com)

## Acknowledgments

- [CS50: Introduction to Computer Science](https://cs50.harvard.edu/) - For providing the foundation and inspiration for this project
- [Base44 Platform](https://base44.com/) - For providing the robust backend infrastructure and development platform
- [React](https://reactjs.org/) - For the powerful frontend framework
- [Tailwind CSS](https://tailwindcss.com/) - For the utility-first CSS framework
- [Radix UI](https://www.radix-ui.com/) - For accessible, unstyled UI components
- [Vite](https://vitejs.dev/) - For the fast build tool and development server

