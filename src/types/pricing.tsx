// types/pricing.ts
export interface PricingPlan {
  duration: string;
  price: string;
  sessions: string;
  perSession: string;
  features: string[];
  popular?: boolean;
}

export interface PackagePlans {
  [key: string]: PricingPlan[]; // "2", "3", "5"
}

export interface PackageType {
  name: string;
  description: string;
  plans: PackagePlans;
}

export interface PricingData {
  [key: string]: PackageType; // "1-2", "1-1"
}

export const pricingData: PricingData = {
  "1-2": {
    name: "1:2 Small Group",
    description: "Interactive learning with 1 teacher and 2 students",
    plans: {
      "2": [
        {
          duration: "MONTHLY",
          price: "₱5,200",
          sessions: "8 sessions",
          perSession: "₱650/session",
          features: ["1:2 teacher ratio", "8 sessions per month", "Interactive group learning", "Progress tracking"]
        },
        {
          duration: "QUARTERLY",
          price: "₱14,400",
          sessions: "26 sessions (24+2 free)",
          perSession: "₱600/session",
          features: ["1:2 teacher ratio", "26 sessions total", "2 FREE sessions", "Priority scheduling"],
          popular: true
        },
        {
          duration: "SEMI-ANNUAL",
          price: "₱26,400",
          sessions: "51 sessions (48+3 free)",
          perSession: "₱550/session",
          features: ["1:2 teacher ratio", "51 sessions total", "3 FREE sessions", "Extended support"]
        },
        {
          duration: "ANNUAL",
          price: "₱48,000",
          sessions: "101 sessions (96+5 free)",
          perSession: "₱500/session",
          features: ["1:2 teacher ratio", "101 sessions total", "5 FREE sessions", "Best value"]
        }
      ],
      "3": [
        {
          duration: "MONTHLY",
          price: "₱7,800",
          sessions: "12 sessions",
          perSession: "₱650/session",
          features: ["1:2 teacher ratio", "12 sessions per month", "Interactive group learning", "Progress tracking"]
        },
        {
          duration: "QUARTERLY",
          price: "₱21,600",
          sessions: "38 sessions (36+2 free)",
          perSession: "₱600/session",
          features: ["1:2 teacher ratio", "38 sessions total", "2 FREE sessions", "Priority scheduling"],
          popular: true
        },
        {
          duration: "SEMI-ANNUAL",
          price: "₱39,600",
          sessions: "75 sessions (72+3 free)",
          perSession: "₱550/session",
          features: ["1:2 teacher ratio", "75 sessions total", "3 FREE sessions", "Extended support"]
        },
        {
          duration: "ANNUAL",
          price: "₱72,000",
          sessions: "149 sessions (144+5 free)",
          perSession: "₱500/session",
          features: ["1:2 teacher ratio", "149 sessions total", "5 FREE sessions", "Best value"]
        }
      ],
      "5": [
        {
          duration: "MONTHLY",
          price: "₱13,000",
          sessions: "20 sessions",
          perSession: "₱650/session",
          features: ["1:2 teacher ratio", "20 sessions per month", "Interactive group learning", "Progress tracking"]
        },
        {
          duration: "QUARTERLY",
          price: "₱36,000",
          sessions: "62 sessions (60+2 free)",
          perSession: "₱600/session",
          features: ["1:2 teacher ratio", "62 sessions total", "2 FREE sessions", "Priority scheduling"],
          popular: true
        },
        {
          duration: "SEMI-ANNUAL",
          price: "₱66,000",
          sessions: "123 sessions (120+3 free)",
          perSession: "₱550/session",
          features: ["1:2 teacher ratio", "123 sessions total", "3 FREE sessions", "Extended support"]
        },
        {
          duration: "ANNUAL",
          price: "₱120,000",
          sessions: "245 sessions (240+5 free)",
          perSession: "₱500/session",
          features: ["1:2 teacher ratio", "245 sessions total", "5 FREE sessions", "Best value"]
        }
      ]
    }
  },
  "1-1": {
    name: "1:1 Private",
    description: "Personalized one-on-one tutoring sessions",
    plans: {
      "2": [
        {
          duration: "MONTHLY",
          price: "₱9,600",
          sessions: "8 sessions",
          perSession: "₱1,200/session",
          features: ["1:1 teacher ratio", "8 sessions per month", "Personalized curriculum", "Flexible scheduling"]
        },
        {
          duration: "QUARTERLY",
          price: "₱27,600",
          sessions: "26 sessions (24+2 free)",
          perSession: "₱1,150/session",
          features: ["1:1 teacher ratio", "26 sessions total", "2 FREE sessions", "Dedicated tutor"],
          popular: true
        },
        {
          duration: "SEMI-ANNUAL",
          price: "₱52,320",
          sessions: "51 sessions (48+3 free)",
          perSession: "₱1,090/session",
          features: ["1:1 teacher ratio", "51 sessions total", "3 FREE sessions", "Curriculum customization"]
        },
        {
          duration: "ANNUAL",
          price: "₱93,120",
          sessions: "101 sessions (96+5 free)",
          perSession: "₱970/session",
          features: ["1:1 teacher ratio", "101 sessions total", "5 FREE sessions", "Best value"]
        }
      ],
      "3": [
        {
          duration: "MONTHLY",
          price: "₱14,400",
          sessions: "12 sessions",
          perSession: "₱1,200/session",
          features: ["1:1 teacher ratio", "12 sessions per month", "Personalized curriculum", "Flexible scheduling"]
        },
        {
          duration: "QUARTERLY",
          price: "₱41,400",
          sessions: "38 sessions (36+2 free)",
          perSession: "₱1,150/session",
          features: ["1:1 teacher ratio", "38 sessions total", "2 FREE sessions", "Dedicated tutor"],
          popular: true
        },
        {
          duration: "SEMI-ANNUAL",
          price: "₱78,480",
          sessions: "75 sessions (72+3 free)",
          perSession: "₱1,090/session",
          features: ["1:1 teacher ratio", "75 sessions total", "3 FREE sessions", "Curriculum customization"]
        },
        {
          duration: "ANNUAL",
          price: "₱139,680",
          sessions: "149 sessions (144+5 free)",
          perSession: "₱970/session",
          features: ["1:1 teacher ratio", "149 sessions total", "5 FREE sessions", "Best value"]
        }
      ],
      "5": [
        {
          duration: "MONTHLY",
          price: "₱24,000",
          sessions: "20 sessions",
          perSession: "₱1,200/session",
          features: ["1:1 teacher ratio", "20 sessions per month", "Personalized curriculum", "Flexible scheduling"]
        },
        {
          duration: "QUARTERLY",
          price: "₱69,000",
          sessions: "62 sessions (60+2 free)",
          perSession: "₱1,150/session",
          features: ["1:1 teacher ratio", "62 sessions total", "2 FREE sessions", "Dedicated tutor"],
          popular: true
        },
        {
          duration: "SEMI-ANNUAL",
          price: "₱130,800",
          sessions: "123 sessions (120+3 free)",
          perSession: "₱1,090/session",
          features: ["1:1 teacher ratio", "123 sessions total", "3 FREE sessions", "Curriculum customization"]
        },
        {
          duration: "ANNUAL",
          price: "₱232,800",
          sessions: "245 sessions (240+5 free)",
          perSession: "₱970/session",
          features: ["1:1 teacher ratio", "245 sessions total", "5 FREE sessions", "Best value"]
        }
      ]
    }
  }
};