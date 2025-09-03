import React from "react";

const TeamTechResources = () => {
  const teams = [
    {
      name: "Product Manager / Founder",
      responsibilities: [
        "Define MVP scope",
        "Prioritize features",
        "Coordinate team",
      ],
      tools: [],
      color: "border-purple-500 bg-purple-50"
    },
    {
      name: "Frontend Team",
      tools: ["React", "React Native"],
      responsibilities: [
        "Customer app",
        "Preferences form",
        "AI Waiter chat UI",
        "Chef dashboard UI",
      ],
      color: "border-blue-500 bg-blue-50"
    },
    {
      name: "Backend Team",
      tools: ["Node.js", "Express"],
      responsibilities: [
        "API for orders, profiles",
        "AI Waiter integration",
        "Payments (Stripe)",
        "Delivery API integration",
      ],
      database: ["PostgreSQL", "Firebase Firestore"],
      color: "border-green-500 bg-green-50"
    },
    {
      name: "AI/ML Engineer",
      tools: ["GPT API", "Python"],
      responsibilities: [
        "Chef + meal recommendation",
        "Learning from user ratings",
        "Discovery meal logic",
      ],
      color: "border-orange-500 bg-orange-50"
    },
    {
      name: "QA / Tester",
      responsibilities: [
        "Test customer app",
        "Test chef dashboard",
        "Test AI waiter suggestions",
        "Delivery & payment flows",
      ],
      color: "border-red-500 bg-red-50"
    },
    {
      name: "Operations Team",
      responsibilities: [
        "Recruit & manage chefs",
        "Manage delivery partners",
        "Handle licenses / health",
      ],
      color: "border-indigo-500 bg-indigo-50"
    },
    {
      name: "Marketing / Growth",
      responsibilities: [
        "Acquire pilot users",
        "Social media / landing",
        "Collect feedback",
      ],
      color: "border-pink-500 bg-pink-50"
    },
  ];

  const resources = [
    {
      feature: "Customer app onboarding & preferences",
      dependsOn: "Frontend + Backend + Database",
    },
    {
      feature: "AI Waiter recommendations",
      dependsOn: "Backend + AI/ML + Customer data + Chef menu data",
    },
    {
      feature: "Chef dashboard & menu management",
      dependsOn: "Frontend + Backend + Database",
    },
    {
      feature: "Meal ordering + payment",
      dependsOn: "Backend + Stripe + Frontend",
    },
    {
      feature: "Delivery tracking",
      dependsOn: "Backend + Delivery API + Frontend",
    },
    {
      feature: "Feedback / learning",
      dependsOn: "AI/ML + Backend + Database",
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
          🍔 AI Food Personalization MVP
        </h1>
        <h2 className="text-2xl font-semibold mb-8 text-center text-gray-600">
          Team + Tech + Resources Blueprint
        </h2>

        {/* Visual Flow Chart */}
        <div className="space-y-6 mb-12">
          {teams.map((team, idx) => (
            <div key={idx} className="relative">
              {/* Arrow pointing down (except for last item) */}
              {idx < teams.length - 1 && (
                <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-3 z-10">
                  <div className="w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-t-gray-400"></div>
                </div>
              )}
              
              <div className={`border-l-4 ${team.color} p-6 shadow-lg rounded-lg mx-auto max-w-2xl`}>
                <h3 className="text-xl font-bold mb-3 text-gray-800">{team.name}</h3>
                
                {team.tools && team.tools.length > 0 && (
                  <div className="mb-3">
                    <span className="font-semibold text-gray-700">Tools:</span>{" "}
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                      {team.tools.join(", ")}
                    </span>
                  </div>
                )}
                
                {team.database && team.database.length > 0 && (
                  <div className="mb-3">
                    <span className="font-semibold text-gray-700">Database:</span>{" "}
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                      {team.database.join(", ")}
                    </span>
                  </div>
                )}
                
                <div>
                  <span className="font-semibold text-gray-700">Responsibilities:</span>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    {team.responsibilities.map((resp, i) => (
                      <li key={i} className="text-gray-600">{resp}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Resource Dependencies Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
            🔗 Resource Dependencies
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((res, idx) => (
              <div
                key={idx}
                className="bg-white p-6 shadow-lg rounded-lg border-l-4 border-yellow-500 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="mb-3">
                  <span className="font-bold text-gray-800">Feature / Flow:</span>
                  <p className="text-gray-700 mt-1">{res.feature}</p>
                </div>
                <div>
                  <span className="font-bold text-gray-800">Depends On:</span>
                  <p className="text-sm text-gray-600 mt-1 bg-gray-100 p-2 rounded">{res.dependsOn}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold mb-4">Ready to Build Your MVP? 🚀</h3>
          <p className="text-lg mb-6">
            This blueprint organizes who does what, which tools they use, and dependencies 
            so your team can start building immediately.
          </p>
          <div className="space-x-4">
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              View Dashboard
            </button>
            <button className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Start Development
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamTechResources;