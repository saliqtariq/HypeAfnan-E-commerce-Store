import React from "react";

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 min-h-[70vh]">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Terms of Service</h1>
      <div className="prose prose-gray max-w-none text-gray-600 space-y-6">
        <p className="font-medium text-gray-900">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        <p>
          Welcome to HypeAfnan. By accessing or using our website, purchasing our products, or using our services, you agree to be bound by these Terms of Service. Please read them carefully.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8">1. Online Store Terms</h2>
        <p>
          By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence. You may not use our products for any illegal or unauthorized purpose nor may you, in the use of the Service, violate any laws in your jurisdiction.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8">2. General Conditions</h2>
        <p>
          We reserve the right to refuse service to anyone for any reason at any time. You understand that your content (not including credit card information), may be transferred unencrypted and involve (a) transmissions over various networks; and (b) changes to conform and adapt to technical requirements of connecting networks or devices. Credit card information is always encrypted during transfer over networks.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8">3. Products or Services</h2>
        <p>
          Certain products or services may be available exclusively online through the website. These products or services may have limited quantities and are subject to return or exchange only according to our Return Policy. We have made every effort to display as accurately as possible the colors and images of our products that appear at the store. We cannot guarantee that your computer monitor's display of any color will be accurate.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8">4. Accuracy of Billing and Account Information</h2>
        <p>
          We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household or per order. In the event that we make a change to or cancel an order, we may attempt to notify you by contacting the e-mail and/or billing address/phone number provided at the time the order was made.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8">5. Intellectual Property</h2>
        <p>
          The website and its entire contents, features, and functionality (including but not limited to all information, software, text, displays, images, video, and audio) are owned by HypeAfnan and are protected by international copyright, trademark, and other intellectual property laws.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8">6. Changes to Terms of Service</h2>
        <p>
          You can review the most current version of the Terms of Service at any time at this page. We reserve the right, at our sole discretion, to update, change or replace any part of these Terms of Service by posting updates and changes to our website.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8">7. Contact Information</h2>
        <p>
          Questions about the Terms of Service should be sent to us by phone at <a href="tel:+923199775990" className="text-[#38c172] hover:underline">+923199775990</a>.
        </p>
      </div>
    </div>
  );
}
