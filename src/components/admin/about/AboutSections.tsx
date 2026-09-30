"use client";

import { withForm } from "@/components/admin/form/app-form";
import { FieldCard, ListItem, ListSection } from "@/components/admin/form/form-parts";
import { VISIBILITY_SECTIONS, aboutFormOptions } from "./about-form";

export const SectionsTab = withForm({
  ...aboutFormOptions,
  render: function SectionsTab({ form }) {
    return (
      <FieldCard
        title="Publish or hide sections"
        description="Hidden sections keep their content, so you can bring them back any time."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {VISIBILITY_SECTIONS.map((section) => (
            <form.AppField key={section.key} name={`section_visibility.${section.key}`}>
              {(field) => (
                <field.VisibilityField title={section.title} description={section.description} />
              )}
            </form.AppField>
          ))}
        </div>
      </FieldCard>
    );
  },
});

export const HeroTab = withForm({
  ...aboutFormOptions,
  render: function HeroTab({ form }) {
    return (
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <FieldCard title="Hero" description="The first thing readers see on the About page.">
            <form.AppField name="hero.tagline">
              {(f) => <f.TextField label="Overline" maxLength={160} />}
            </form.AppField>
            <form.AppField name="hero.title">
              {(f) => <f.TextField label="Name / headline" maxLength={120} />}
            </form.AppField>
            <form.AppField name="hero.lead">
              {(f) => <f.TextField label="Lead statement" maxLength={300} rows={2} />}
            </form.AppField>
          </FieldCard>

          <form.Field name="hero.story" mode="array">
            {(list) => (
              <ListSection
                title="Your story"
                description="Paragraphs beside the portrait, in reading order."
                addLabel="Add paragraph"
                onAdd={() => list.pushValue("")}
                count={list.state.value.length}
                max={12}
                emptyText="No story yet. Add the first paragraph."
              >
                {list.state.value.map((_, i) => (
                  <ListItem
                    key={i}
                    index={i}
                    count={list.state.value.length}
                    label="paragraph"
                    onMove={list.moveValue}
                    onRemove={list.removeValue}
                  >
                    <form.AppField name={`hero.story[${i}]`}>
                      {(f) => (
                        <f.TextField label={`Paragraph ${i + 1}`} rows={4} maxLength={1500} />
                      )}
                    </form.AppField>
                  </ListItem>
                ))}
              </ListSection>
            )}
          </form.Field>
        </div>

        <div className="lg:col-span-4">
          <FieldCard title="Portrait" description="Remove it to hide the portrait everywhere.">
            <form.AppField name="hero.image_url">
              {(f) => (
                <f.ImageField
                  label="Author portrait"
                  purpose="portrait"
                  aspectClassName="aspect-[4/5]"
                  description="Shown on the About page and the homepage, cropped to 4:5."
                />
              )}
            </form.AppField>
            <form.AppField name="hero.image_alt">
              {(f) => (
                <f.TextField
                  label="Description (alt text)"
                  maxLength={250}
                  hint="What the photo shows, for readers who can't see it."
                />
              )}
            </form.AppField>
            <form.AppField name="hero.image_caption">
              {(f) => <f.TextField label="Caption (optional)" maxLength={200} />}
            </form.AppField>
            <form.AppField name="hero.image_location">
              {(f) => <f.TextField label="Location label (optional)" maxLength={60} />}
            </form.AppField>
          </FieldCard>
        </div>
      </div>
    );
  },
});

export const VoiceTab = withForm({
  ...aboutFormOptions,
  render: function VoiceTab({ form }) {
    return (
      <div className="space-y-6">
        <FieldCard title="The short version" description="The paragraph beside your roles.">
          <form.AppField name="short_version.heading">
            {(f) => <f.TextField label="Heading" maxLength={240} />}
          </form.AppField>
          <form.AppField name="short_version.body">
            {(f) => <f.TextField label="Paragraph" rows={4} maxLength={1200} />}
          </form.AppField>
        </FieldCard>

        <form.Field name="hero.roles" mode="array">
          {(list) => (
            <ListSection
              title="Roles"
              description="The role badges in the short version."
              addLabel="Add role"
              onAdd={() => list.pushValue({ label: "", sub: "" })}
              count={list.state.value.length}
              max={12}
              emptyText="No roles yet."
            >
              {list.state.value.map((_, i) => (
                <ListItem
                  key={i}
                  index={i}
                  count={list.state.value.length}
                  label="role"
                  onMove={list.moveValue}
                  onRemove={list.removeValue}
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <form.AppField name={`hero.roles[${i}].label`}>
                      {(f) => <f.TextField label="Role" placeholder="Developer" maxLength={80} />}
                    </form.AppField>
                    <div className="sm:col-span-2">
                      <form.AppField name={`hero.roles[${i}].sub`}>
                        {(f) => <f.TextField label="What it means" maxLength={200} />}
                      </form.AppField>
                    </div>
                  </div>
                </ListItem>
              ))}
            </ListSection>
          )}
        </form.Field>

        <form.Field name="identity_stages" mode="array">
          {(list) => (
            <ListSection
              title="A few versions of me"
              description="Shown beside your portrait on the homepage. The section hides when empty."
              addLabel="Add version"
              onAdd={() =>
                list.pushValue({
                  number: String(list.state.value.length + 1).padStart(2, "0"),
                  role: "",
                  description: "",
                })
              }
              count={list.state.value.length}
              max={20}
              emptyText="No versions yet."
            >
              {list.state.value.map((_, i) => (
                <ListItem
                  key={i}
                  index={i}
                  count={list.state.value.length}
                  label="version"
                  onMove={list.moveValue}
                  onRemove={list.removeValue}
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                    <form.AppField name={`identity_stages[${i}].number`}>
                      {(f) => <f.TextField label="Number" maxLength={10} />}
                    </form.AppField>
                    <div className="sm:col-span-3">
                      <form.AppField name={`identity_stages[${i}].role`}>
                        {(f) => (
                          <f.TextField label="Version" placeholder="Learner" maxLength={100} />
                        )}
                      </form.AppField>
                    </div>
                  </div>
                  <form.AppField name={`identity_stages[${i}].description`}>
                    {(f) => <f.TextField label="Description" rows={2} maxLength={600} />}
                  </form.AppField>
                </ListItem>
              ))}
            </ListSection>
          )}
        </form.Field>
      </div>
    );
  },
});

export const TimelineTab = withForm({
  ...aboutFormOptions,
  render: function TimelineTab({ form }) {
    return (
      <form.Field name="timeline" mode="array">
        {(list) => (
          <ListSection
            title="The path"
            description="Milestones in the order they should appear."
            addLabel="Add milestone"
            onAdd={() => list.pushValue({ period: "", title: "", detail: "" })}
            count={list.state.value.length}
            max={30}
            emptyText="No milestones yet."
          >
            {list.state.value.map((_, i) => (
              <ListItem
                key={i}
                index={i}
                count={list.state.value.length}
                label="milestone"
                onMove={list.moveValue}
                onRemove={list.removeValue}
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <form.AppField name={`timeline[${i}].period`}>
                    {(f) => <f.TextField label="Period" placeholder="2021 – 2023" maxLength={60} />}
                  </form.AppField>
                  <div className="sm:col-span-2">
                    <form.AppField name={`timeline[${i}].title`}>
                      {(f) => <f.TextField label="Title" maxLength={160} />}
                    </form.AppField>
                  </div>
                </div>
                <form.AppField name={`timeline[${i}].detail`}>
                  {(f) => <f.TextField label="Detail" rows={3} maxLength={800} />}
                </form.AppField>
              </ListItem>
            ))}
          </ListSection>
        )}
      </form.Field>
    );
  },
});

export const ProjectsTab = withForm({
  ...aboutFormOptions,
  render: function ProjectsTab({ form }) {
    return (
      <form.Field name="projects" mode="array">
        {(list) => (
          <ListSection
            title="Escaped the notebook"
            description="Projects and products that grew out of the writing."
            addLabel="Add project"
            onAdd={() => list.pushValue({ name: "", desc: "", tag: "" })}
            count={list.state.value.length}
            max={20}
            emptyText="No projects yet."
          >
            {list.state.value.map((_, i) => (
              <ListItem
                key={i}
                index={i}
                count={list.state.value.length}
                label="project"
                onMove={list.moveValue}
                onRemove={list.removeValue}
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <form.AppField name={`projects[${i}].name`}>
                      {(f) => <f.TextField label="Name" maxLength={120} />}
                    </form.AppField>
                  </div>
                  <form.AppField name={`projects[${i}].tag`}>
                    {(f) => <f.TextField label="Tag" placeholder="Product" maxLength={60} />}
                  </form.AppField>
                </div>
                <form.AppField name={`projects[${i}].desc`}>
                  {(f) => <f.TextField label="Description" rows={3} maxLength={800} />}
                </form.AppField>
                <form.AppField name={`projects[${i}].link`}>
                  {(f) => (
                    <f.TextField
                      label="Link (optional)"
                      type="url"
                      placeholder="https://"
                      optional
                    />
                  )}
                </form.AppField>
              </ListItem>
            ))}
          </ListSection>
        )}
      </form.Field>
    );
  },
});

export const FiguringTab = withForm({
  ...aboutFormOptions,
  render: function FiguringTab({ form }) {
    return (
      <form.Field name="still_figuring_out" mode="array">
        {(list) => (
          <ListSection
            title="Still figuring it out"
            description="Questions you are living with, and what you think so far."
            addLabel="Add question"
            onAdd={() => list.pushValue({ question: "", reflection: "" })}
            count={list.state.value.length}
            max={20}
            emptyText="No open questions yet."
          >
            {list.state.value.map((_, i) => (
              <ListItem
                key={i}
                index={i}
                count={list.state.value.length}
                label="question"
                onMove={list.moveValue}
                onRemove={list.removeValue}
              >
                <form.AppField name={`still_figuring_out[${i}].question`}>
                  {(f) => <f.TextField label="Question" maxLength={300} />}
                </form.AppField>
                <form.AppField name={`still_figuring_out[${i}].reflection`}>
                  {(f) => <f.TextField label="Reflection" rows={3} maxLength={1600} />}
                </form.AppField>
                <form.AppField name={`still_figuring_out[${i}].tag`}>
                  {(f) => <f.TextField label="Tag (optional)" maxLength={80} optional />}
                </form.AppField>
              </ListItem>
            ))}
          </ListSection>
        )}
      </form.Field>
    );
  },
});

export const CurrentlyTab = withForm({
  ...aboutFormOptions,
  render: function CurrentlyTab({ form }) {
    return (
      <form.Field name="currently" mode="array">
        {(list) => (
          <ListSection
            title="Currently"
            description="What you are learning, building and writing right now."
            addLabel="Add focus"
            onAdd={() => list.pushValue({ verb: "", detail: "" })}
            count={list.state.value.length}
            max={20}
            emptyText="Nothing listed right now."
          >
            {list.state.value.map((_, i) => (
              <ListItem
                key={i}
                index={i}
                count={list.state.value.length}
                label="focus"
                onMove={list.moveValue}
                onRemove={list.removeValue}
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <form.AppField name={`currently[${i}].verb`}>
                    {(f) => <f.TextField label="Verb" placeholder="Learning" maxLength={80} />}
                  </form.AppField>
                  <div className="sm:col-span-2">
                    <form.AppField name={`currently[${i}].detail`}>
                      {(f) => <f.TextField label="Detail" maxLength={400} />}
                    </form.AppField>
                  </div>
                </div>
              </ListItem>
            ))}
          </ListSection>
        )}
      </form.Field>
    );
  },
});

export const WordsTab = withForm({
  ...aboutFormOptions,
  render: function WordsTab({ form }) {
    return (
      <div className="space-y-6">
        <FieldCard title="Why this exists" description="The dark manifesto band.">
          <form.AppField name="manifesto.quote">
            {(f) => <f.TextField label="Quote" rows={2} maxLength={800} />}
          </form.AppField>
          <form.AppField name="manifesto.body">
            {(f) => <f.TextField label="Paragraph" rows={4} maxLength={1600} />}
          </form.AppField>
          <form.AppField name="manifesto.closing">
            {(f) => <f.TextField label="Signature line" maxLength={400} />}
          </form.AppField>
        </FieldCard>

        <FieldCard title="Open knowledge" description="The Wikimedia and documentation chapter.">
          <form.AppField name="open_knowledge.heading">
            {(f) => <f.TextField label="Heading" maxLength={240} />}
          </form.AppField>
          <form.AppField name="open_knowledge.lead">
            {(f) => <f.TextField label="Lead" rows={3} maxLength={1200} />}
          </form.AppField>
          <form.AppField name="open_knowledge.quote">
            {(f) => <f.TextField label="Quote" rows={2} maxLength={800} />}
          </form.AppField>
          <form.AppField name="open_knowledge.closing">
            {(f) => <f.TextField label="Closing sentence" rows={2} maxLength={800} />}
          </form.AppField>
        </FieldCard>

        <form.Field name="open_knowledge.topics" mode="array">
          {(list) => (
            <ListSection
              title="Open knowledge topics"
              addLabel="Add topic"
              onAdd={() => list.pushValue("")}
              count={list.state.value.length}
              max={20}
              emptyText="No topics yet."
            >
              {list.state.value.map((_, i) => (
                <ListItem
                  key={i}
                  index={i}
                  count={list.state.value.length}
                  label="topic"
                  onMove={list.moveValue}
                  onRemove={list.removeValue}
                >
                  <form.AppField name={`open_knowledge.topics[${i}]`}>
                    {(f) => <f.TextField label={`Topic ${i + 1}`} maxLength={120} />}
                  </form.AppField>
                </ListItem>
              ))}
            </ListSection>
          )}
        </form.Field>

        <FieldCard title="Closing" description="The final words of the About page.">
          <form.AppField name="closing.quote">
            {(f) => <f.TextField label="Final quote" rows={2} maxLength={800} />}
          </form.AppField>
        </FieldCard>
      </div>
    );
  },
});
