import { HeroSection } from '../../level1/HeroSection'
import { FeaturesSection } from '../../level1/FeaturesSection'
import { ContactSection } from '../../level1/ContactSection'
import { ServerStatusPanel } from '../../status/ServerStatusPanel'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { GitHubActionsFetcher } from '../../misc/github/GitHubActionsFetcher'
import { IntroSection } from '../sections/IntroSection'

interface Level1TabsProps {
  onNavigate: (level: number) => void
}

export function Level1Tabs({ onNavigate }: Level1TabsProps) {
  return (
    <Tabs defaultValue="home" className="w-full">
      <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-3 mb-8">
        <TabsTrigger value="home">Home</TabsTrigger>
        <TabsTrigger value="github-actions">GitHub Actions</TabsTrigger>
        <TabsTrigger value="status">Server Status</TabsTrigger>
      </TabsList>

      <TabsContent value="home" className="mt-0 space-y-12">
        <HeroSection onNavigate={onNavigate} />
        <FeaturesSection />
        <IntroSection
          id="about"
          title="About MetaBuilder"
          description="MetaBuilder is a revolutionary platform that lets you build entire application stacks through visual interfaces."
        >
          <p className="text-lg text-muted-foreground">
            Whether you're a designer who wants to create without code, or a developer who wants to
            work at a higher level of abstraction, MetaBuilder adapts to your needs.
          </p>
        </IntroSection>
        <ContactSection />
      </TabsContent>

      <TabsContent value="github-actions" className="mt-0">
        <GitHubActionsFetcher />
      </TabsContent>

      <TabsContent value="status" className="mt-0">
        <IntroSection
          title="Server Status"
          description="Monitor the DBAL stack, Prisma schema, and the C++ daemon from this interface."
        >
          <ServerStatusPanel />
        </IntroSection>
      </TabsContent>
    </Tabs>
  )
}
