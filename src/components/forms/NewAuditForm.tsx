import React from 'react';
import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import  GenerativeData  from '@/lib/gemini-ai/GenerativeData';
import { useNavigate } from 'react-router-dom';


const BusinessValidation = z.object({
  businessName: z.string().min(1, "Business name is required"),
  businessDomain: z.string().min(1, "Business domain is required"),
  businessLocation: z.string().min(1, "Business location is required"),
  description: z.string().min(1, "Description is required"),
});

const BusinessDetailsForm = ({ onSubmitSuccess }) => {
  const form = useForm({
    resolver: zodResolver(BusinessValidation),
    defaultValues: {
      businessName: "",
      businessDomain: "",
      businessLocation: "",
      description: "",
    },
  });


  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const navigate = useNavigate();

  
  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const db = getFirestore();

      // Create initial document with form values and 0% progress
      const docRef = await addDoc(collection(db, 'businessAudits'), {
        ...values,
        progress: 0,
        generatedAudit: null
      });
      
      setSubmitMessage('Audit submitted successfully!');
      form.reset(); // Reset the form after successful submission
      
      // Redirect to home page
      navigate('/');

      // Start the GenerativeData process
      GenerativeData(docRef.id, values);

      
    } catch (error) {
      console.error("Error adding document: ", error);
      setSubmitMessage('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }

    if (onSubmitSuccess) {
      onSubmitSuccess();
    }
  };
  

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <h2 className="text-2xl font-bold">Business Details</h2>
        <p className="text-gray-500">Provide your business details to get an quick audit.</p>
        
        <FormField
          control={form.control}
          name="businessName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Name</FormLabel>
              <FormControl>
                <Input placeholder="Acme Inc" {...field} />
              </FormControl>
              <FormMessage className="text-red" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="businessDomain"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Domain</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Domain your business belongs to" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white">
                  <SelectItem value="tech">Technology</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="transportation">Transportation</SelectItem>
                  <SelectItem value="energy">Energy</SelectItem>
                  <SelectItem value="realestate">Real Estate</SelectItem>
                  <SelectItem value="agriculture">Agriculture</SelectItem>
                  <SelectItem value="pharmaceuticals">Pharmaceuticals</SelectItem>
                  <SelectItem value="construction">Construction</SelectItem>
                  <SelectItem value="hospitality">Hospitality</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="nonprofit">Non-Profit</SelectItem>
                  <SelectItem value="automotive">Automotive</SelectItem>
                  <SelectItem value="fashion">Fashion</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage className="text-red" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="businessLocation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Location</FormLabel>
              <FormControl>
                <Input placeholder="drop google link here.." {...field} />
              </FormControl>
              <FormMessage className="text-red" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Tell us more about your business, which will help us to find relevant information." 
                  className="resize-none" 
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red" />
            </FormItem>
          )}
        />

        <Button type="submit"  className="w-full bg-black text-white hover:bg-gray-800 transition-colors duration-200" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>

        {submitMessage && (
            <p className={submitMessage.includes('error') ? 'text-red-500' : 'text-green-500'}>
                {submitMessage}
            </p>
        )}

      </form>
    </Form>
  );
};

export default BusinessDetailsForm;