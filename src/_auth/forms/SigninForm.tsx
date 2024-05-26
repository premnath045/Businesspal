import { Link, useNavigate } from 'react-router-dom'
import { useToast } from "@/components/ui/use-toast"
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Button } from '@/components/ui/button'
import { signinValidation } from '@/lib/validation'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import Loader from '@/components/shared/Loader'
import { useSignInAccount } from '@/lib/react-query/queriesAndMutations'
import { useUserContext } from '@/context/AuthContext'


const SigninForm = () => {
  const { toast } = useToast()
  const { checkAuthUser, isLoading: isUserLoading } = useUserContext();
  const navigate = useNavigate();


  const { mutateAsync: signInAccount } = useSignInAccount();

  // Define form structure
  const form = useForm<z.infer<typeof signinValidation>>({
    resolver: zodResolver(signinValidation),
    defaultValues: {
      email: '',
      password: '',
    },
  })
 
  // Define form submit handler.
  async function onSubmit(values: z.infer<typeof signinValidation>) {

    // asigns authenticated user into a session
     const session = await signInAccount({
      email: values.email,
      password: values.password,
    })

    if(!session) {
      toast({ title:"sign-in failed. please try again." })
      return
    }

    const isLoggedIn = await checkAuthUser();
    if(isLoggedIn){
      form.reset();
      navigate('/')
    } else {
      toast({title: "Login failed, please try again."})
      return
    } 

  }

  return (
    <Form {...form}>
      <div className='sm:w-420 flex-center flex-col'>
        <img src="/assets/images/logo.svg" />

        <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">Log in to your account</h2>
        <p className="text-light-3 small-medium md:base-regular mt-2">Welcome back!</p>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 w-full mt-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="enter email" type='email' className='shad-input' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input placeholder="enter password" type='password' className='shad-input' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="shad-button_primary">
              {isUserLoading ? (
                <div className='flex-center gap-2'>
                  <Loader />
                  Loading...
                </div>
              ) : (
                <div className='flex-center gap-2'>Signin</div>
              )}
          </Button>

          <p className='text-small-regular text-light-2 text-center mt-2'>
            Don't have an account?
            <Link to="/sign-up" className='text-primary-500 text-small-semibold ml-1'>Sign up</Link>
          </p>
        </form>
      </div>
    </Form>
  )
}

export default SigninForm