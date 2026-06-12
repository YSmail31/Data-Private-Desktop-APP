'use client'

import { useState } from 'react'
import { Check, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface ApiSectionProps {
  t: {
    apiSection: {
      title: string
      subtitle: string
      features: { title: string; desc: string }[]
      ctaDoc: string
    }
  }
  lang: 'fr' | 'en'
}

const pipelineSteps = [
  {
    step: '01',
    label: 'Ingress',
    title: 'Détection',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
      </svg>
    ),
    desc: 'PII, secrets, données bancaires, santé, identifiants, schémas métier. NER propriétaires + règles configurables.',
  },
  {
    step: '02',
    label: 'Transform',
    title: 'Anonymisation',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
    desc: 'Tokenisation réversible, pseudonymisation cohérente. Mapping stocké dans votre périmètre, jamais chez nous.',
  },
  {
    step: '03',
    label: 'Relay',
    title: 'Transmission',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
      </svg>
    ),
    desc: 'Envoi au LLM cible : OpenAI, Anthropic, Mistral, Gemini, Llama, vLLM. mTLS, rotation de clés.',
  },
  {
    step: '04',
    label: 'Egress',
    title: 'Restitution',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    desc: 'Ré-identification contrôlée de la réponse. Journal inaltérable. Réponse livrée à votre app.',
  },
]

export function ApiSection({ t, lang }: ApiSectionProps) {
  const [selectedLang, setSelectedLang] = useState<'curl' | 'javascript' | 'python' | 'php' | 'go' | 'ruby'>('curl')

  return (
    <section id="api" className="snap-start min-h-screen flex flex-col justify-center py-20 px-4 sm:px-6 bg-muted/10 overflow-hidden">
      <div className="max-w-6xl mx-auto w-full">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-5xl font-black mb-4 tracking-tight">
            {t.apiSection.title}
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t.apiSection.subtitle}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Code Example with Language Tabs */}
          <div className="bg-[#0f111a] rounded-2xl overflow-hidden shadow-xl border border-border/50">
            {/* Language Tabs */}
            <div className="flex items-center gap-1 px-4 py-2 border-b border-white/10 overflow-x-auto">
              {[
                { id: 'curl', label: 'cURL' },
                { id: 'javascript', label: 'JavaScript' },
                { id: 'python', label: 'Python' },
                { id: 'php', label: 'PHP' },
                { id: 'go', label: 'Go' },
                { id: 'ruby', label: 'Ruby' },
              ].map((l) => (
                <button
                  key={l.id}
                  onClick={() => setSelectedLang(l.id as typeof selectedLang)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                    selectedLang === l.id
                      ? 'bg-white text-black'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700/50">
              <span className="text-xs text-gray-400 font-mono">POST /api/anonymize</span>
              <button
                onClick={() => navigator.clipboard.writeText('')}
                className="text-xs text-gray-500 hover:text-white transition-colors"
              >
                Copier
              </button>
            </div>

            <pre className="p-4 text-sm font-mono overflow-x-auto max-h-[320px] h-full">
              <code className="text-gray-300 text-wrap">
                {selectedLang === 'curl' && `curl -X POST https://api.dataprivate.ai/v1/anonymize \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Jean Dupont habite au 27 avenue des Lilas, Paris.",
    "language": "${lang}"
  }'`}
                {selectedLang === 'javascript' && `// JavaScript / Node.js
const response = await fetch('https://api.dataprivate.ai/v1/anonymize', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    text: "Jean Dupont habite au 27 avenue des Lilas, Paris.",
    language: "${lang}"
  })
});

const data = await response.json();
console.log(data.anonymized_text);`}
                {selectedLang === 'python' && `# Python
import requests

response = requests.post(
    'https://api.dataprivate.ai/v1/anonymize',
    headers={
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
    },
    json={
        'text': 'Jean Dupont habite au 27 avenue des Lilas, Paris.',
        'language': '${lang}'
    }
)

data = response.json()
print(data['anonymized_text'])`}
                {selectedLang === 'php' && `<?php
// PHP
$ch = curl_init('https://api.dataprivate.ai/v1/anonymize');

curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer YOUR_API_KEY',
        'Content-Type: application/json'
    ],
    CURLOPT_POSTFIELDS => json_encode([
        'text' => 'Jean Dupont habite au 27 avenue des Lilas, Paris.',
        'language' => '${lang}'
    ])
]);

$response = curl_exec($ch);
$data = json_decode($response, true);
echo $data['anonymized_text'];`}
                {selectedLang === 'go' && `// Go
package main

import (
    "bytes"
    "encoding/json"
    "net/http"
)

func main() {
    payload := map[string]string{
        "text":     "Jean Dupont habite au 27 avenue des Lilas, Paris.",
        "language": "${lang}",
    }
    body, _ := json.Marshal(payload)

    req, _ := http.NewRequest("POST",
        "https://api.dataprivate.ai/v1/anonymize",
        bytes.NewBuffer(body))

    req.Header.Set("Authorization", "Bearer YOUR_API_KEY")
    req.Header.Set("Content-Type", "application/json")

    client := &http.Client{}
    resp, _ := client.Do(req)
    // Handle response...
}`}
                {selectedLang === 'ruby' && `# Ruby
require 'net/http'
require 'json'

uri = URI('https://api.dataprivate.ai/v1/anonymize')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true

request = Net::HTTP::Post.new(uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'
request['Content-Type'] = 'application/json'
request.body = {
  text: 'Jean Dupont habite au 27 avenue des Lilas, Paris.',
  language: '${lang}'
}.to_json

response = http.request(request)
data = JSON.parse(response.body)
puts data['anonymized_text']`}
              </code>
            </pre>
          </div>

          {/* Response Example */}
          <div className="bg-[#0f111a] rounded-2xl overflow-hidden shadow-xl border border-border/50">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-green-400 font-medium">200 OK</span>
              </div>
              <span className="text-xs text-gray-400 font-mono">Response JSON</span>
            </div>
            <pre className="p-4 text-sm font-mono overflow-x-auto max-h-[360px]">
              <code className="text-gray-300">
                {`{
  "success": true,
  "anonymized_text": "PERSON_1 habite au ADDRESS_1.",
  "entities": [
    {
      "type": "PERSON",
      "original": "Jean Dupont",
      "replacement": "PERSON_1",
      "confidence": 0.98,
      "position": [0, 11]
    },
    {
      "type": "ADDRESS",
      "original": "27 avenue des Lilas, Paris",
      "replacement": "ADDRESS_1",
      "confidence": 0.95,
      "position": [22, 48]
    }
  ],
  "entities_count": 2,
  "processing_time_ms": 127
}`}
              </code>
            </pre>
          </div>
        </div>

        {/* API Features */}
        <div className="grid sm:grid-cols-3 gap-4 mt-8">
          {t.apiSection.features.map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border group hover:border-foreground/50 transition-colors">
              <Check className="w-5 h-5 text-foreground" />
              <div>
                <div className="font-medium text-sm">{item.title}</div>
                <div className="text-xs text-muted-foreground">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Pipeline — 4 steps */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-border rounded-2xl overflow-hidden">
          {pipelineSteps.map((s, i) => (
            <div
              key={s.step}
              className={cn(
                'p-6 flex flex-col gap-4 bg-card hover:bg-muted/30 transition-colors duration-200',
                i < pipelineSteps.length - 1 && 'border-b lg:border-b-0 lg:border-r border-border'
              )}
            >
              {/* Step label */}
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <span className="text-primary">+</span> {s.step} · {s.label}
              </p>

              {/* Icon */}
              <div className="text-primary">{s.icon}</div>

              {/* Title */}
              <h4 className="font-bold text-base text-foreground">{s.title}</h4>

              {/* Description */}
              <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/documentation">
            <Button variant="outline" className="rounded-xl font-bold h-11 px-6 gap-2 hover:bg-foreground hover:text-background transition-all duration-300">
              <FileText className="w-4 h-4" />
              {t.apiSection.ctaDoc}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
