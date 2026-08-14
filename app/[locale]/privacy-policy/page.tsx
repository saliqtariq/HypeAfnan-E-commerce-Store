import React from "react";

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 min-h-[70vh]">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
      <div className="prose prose-gray max-w-none text-gray-600 space-y-6">
        <p className="font-medium text-gray-900">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        <p>
          At HypeAfnan, we take your privacy seriously. This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from our website (the "Site").
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8">1. Personal Information We Collect</h2>
        <p>
          When you visit the Site, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device. Additionally, as you browse the Site, we collect information about the individual web pages or products that you view, what websites or search terms referred you to the Site, and information about how you interact with the Site.
        </p>
        <p>
          Additionally, when you make a purchase or attempt to make a purchase through the Site, we collect certain information from you, including your name, billing address, shipping address, payment information, email address, and phone number. We refer to this information as "Order Information."
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8">2. How We Use Your Personal Information</h2>
        <p>
          We use the Order Information that we collect generally to fulfill any orders placed through the Site (including processing your payment information, arranging for shipping, and providing you with invoices and/or order confirmations). Additionally, we use this Order Information to:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Communicate with you;</li>
          <li>Screen our orders for potential risk or fraud; and</li>
          <li>When in line with the preferences you have shared with us, provide you with information or advertising relating to our products or services.</li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-900 mt-8">3. Sharing Your Personal Information</h2>
        <p>
          We share your Personal Information with third parties to help us use your Personal Information, as described above. We use third-party payment processors and analytics providers to help us understand how our customers use the Site.
        </p>
        <p>
          Finally, we may also share your Personal Information to comply with applicable laws and regulations, to respond to a subpoena, search warrant or other lawful request for information we receive, or to otherwise protect our rights.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8">4. Data Retention</h2>
        <p>
          When you place an order through the Site, we will maintain your Order Information for our records unless and until you ask us to delete this information.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8">5. Changes to This Policy</h2>
        <p>
          We may update this privacy policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal or regulatory reasons.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8">6. Contact Us</h2>
        <p>
          For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by phone at <a href="tel:+923199775990" className="text-[#38c172] hover:underline">+923199775990</a>.
        </p>
      </div>
    </div>
  );
}
